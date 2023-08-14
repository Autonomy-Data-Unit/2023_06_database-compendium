# AUTOGENERATED! DO NOT EDIT! File to edit: ../../nbs/03_police_data_api_scrapers.ipynb.

# %% auto 0
__all__ = ['flatten_list', 'get_constituency_coordinates', 'get_street_level_crimes', 'get_police_forces', 'get_crimes_no_loc',
           'get_stop_searches', 'get_searches_no_loc', 'get_unique_col_vals']

# %% ../../nbs/03_police_data_api_scrapers.ipynb 3
import requests
import math
import pandas as pd

# %% ../../nbs/03_police_data_api_scrapers.ipynb 4
def flatten_list(nested_list):
    flattened_list = []
    for item in nested_list:
        if isinstance(item, list):
            flattened_list += flatten_list(item)
        else:
            if len(flattened_list) % 2 == 1:
                flattened_list[-1].append(item)
            else:
                flattened_list.append([item])
    return flattened_list

# %% ../../nbs/03_police_data_api_scrapers.ipynb 5
def get_constituency_coordinates():
    """
    This function was created to make it easier to search the police data api using poly areas rather 
    than a small area around a single coordinate.
    
    Returns a dictionary containing very low level poly areas (as a string) which outline a constituency. 
    The keys are the constituency names.
    """
    url = 'https://nihr.opendatasoft.com/api/records/1.0/search/?dataset=westminster-parliamentary-constituencies&rows=650'
    response = requests.get(url)
    
    if response.status_code == 200:
        records = response.json()['records']
        constituency_coords = {}

        for record in records:
            coords = []
            name = record['fields']['pcon22nm']
            temp_coords = record['fields']['geo_shape']['coordinates']
        
            temp_coords = flatten_list(temp_coords)
        
            offset = math.floor(len(temp_coords)/4)
            constituency_coords[name] = (str(round(temp_coords[0][1], 3)) + ',' + str(round(temp_coords[0][0], 3)) + ':')
            constituency_coords[name] += (str(round(temp_coords[offset][1], 3)) + ',' + str(round(temp_coords[offset][0], 3)) + ':')
            constituency_coords[name] += (str(round(temp_coords[offset*2][1], 3)) + ',' + str(round(temp_coords[offset*2][0], 3)) + ':')
            constituency_coords[name] += (str(round(temp_coords[offset*3][1], 3)) + ',' + str(round(temp_coords[offset*3][0], 3)))
        
        return constituency_coords
    
    else:
        return -1
        

# %% ../../nbs/03_police_data_api_scrapers.ipynb 7
def get_street_level_crimes(location={'lat': 0, 'lng': 0}, # Location needs to be entered as a dictionary.
                            date='2023-01', # Date should only include year and month (yyyy-mm) as a string.
                            loctype=''):    # Enter poly if using a poly area, leave blank otherwise.
    """
    Won't work if there are more than 10000 crimes in the requested area.

    Location by default needs to be entered as follows: {'lat': 51.510, 'lng': -0.118} 
    which corresponds to Central London.
    
    The poly area uses lat/lng pairs to define the boundary.
    For the poly area to work the location must be entered as a string in 
    the form [lat],[lng]:[lat],[lng]:[lat],[lng]. 
    For example: '51.543,-0.017:51.517,-0.034:51.531,-0.066:51.536,-0.044'

    Function returns a list of the crimes from a given month within a 1 mile
    radius of the location given or within a poly area and the date the data
    was last updated. The last updated is the same for the street level crimes
    with no locations data as it is all updated at the same time.
    """
    if type(location) == dict:
        location = 'lat=' + str(location['lat']) + '&lng=' + str(location['lng'])
        url = 'https://data.police.uk/api/crimes-street/all-crime?' + location + '&date=' + date

        response = requests.get(url)
        if response.status_code == 200:
            street_level_crimes = response.json()
        else:
            street_level_crimes = 'Status code: ' + str(response.status_code)

    elif loctype == 'poly':
        url = 'https://data.police.uk/api/crimes-street/all-crime?poly=' + location + '&date=' + date

        response = requests.get(url)
        if response.status_code == 200:
            street_level_crimes = response.json()
        else:
            street_level_crimes = 'Status code: ' + str(response.status_code)

    else:
        street_level_crimes = "The location must be entered as a dictionary in the form: \n{'lat': lat, 'lng': lon}\n" + \
        "or the loctype must be poly"

    update_url = 'https://data.police.uk/api/crime-last-updated'
    update_response = requests.get(update_url)
    if update_response.status_code == 200:
        last_updated = update_response.json()['date']
    else:
        last_updated = float('NaN')

    return street_level_crimes, last_updated

# %% ../../nbs/03_police_data_api_scrapers.ipynb 9
def get_police_forces():
    """
    Returns a list of the police forces in the UK. These are used 
    in the no_loc functions. The user can search the list for the 
    relevant force for the area they want to collect data for.
    """
    url = 'https://data.police.uk/api/forces'
    response = requests.get(url)
    forces = []

    if response.status_code == 200:
        for force in response.json():
            forces.append(force['id'])
        return forces
    else:
        return -1

# %% ../../nbs/03_police_data_api_scrapers.ipynb 11
def get_crimes_no_loc(force, date):
    """ 
    Function to get crimes that don't have a location and therefore we have to 
    search by police force.
    The date should be a string in the form 'yyyy-mm'.
    """
    url = 'https://data.police.uk/api/crimes-no-location?category=all-crime&force=' \
    + force + '&date=' + date

    response = requests.get(url)

    if response.status_code == 200:
        no_loc_crimes = response.json()
    else:
        no_loc_crimes = 'Status code: ' + str(response.status_code)

    return no_loc_crimes

# %% ../../nbs/03_police_data_api_scrapers.ipynb 13
def get_stop_searches(location={'lat': 0, 'lng': 0}, # Location needs to be entered as a dictionary.
                            date='2023-01', # Date should only include year and month (yyyy-mm) as a string.
                            loctype=''):    # Enter poly if using a poly area, leave blank otherwise.
    """
    Gets a list of the stop and searches carried out at the specified location and date.

    The arguments follow the same format as the get_street_level_crimes function.
    """
    if type(location) == dict:
        location = 'lat=' + str(location['lat']) + '&lng=' + str(location['lng'])
        url = 'https://data.police.uk/api/stops-street?' + location + '&date=' + date

        response = requests.get(url)
        if response.status_code == 200:
            stop_searches = response.json()
        else:
            stop_searches = 'Status code: ' + str(response.status_code)

    elif loctype == 'poly':
        url = 'https://data.police.uk/api/stops-street?poly=' + location + '&date=' + date

        response = requests.get(url)
        if response.status_code == 200:
            stop_searches = response.json()
        else:
            stop_searches = 'Status code: ' + str(response.status_code)

    else:
        stop_searches = "The location must be entered as a dictionary in the form: \n{'lat': lat, 'lng': lon}\n" + \
        "or the loctype must be poly"

    availability_url = 'https://data.police.uk/api/crimes-street-dates'
    availability_response = requests.get(availability_url)
    if availability_response.status_code == 200:
        last_updated = availability_response.json()[0]['date']
    else:
        last_updated = float('NaN')

    return stop_searches, last_updated

# %% ../../nbs/03_police_data_api_scrapers.ipynb 15
def get_searches_no_loc(force, date):
    """ 
    Function to get stop and searches that don't have a location and therefore we have 
    to search by police force
    """
    url = 'https://data.police.uk/api/stops-no-location?force=' \
    + force + '&date=' + date

    response = requests.get(url)

    if response.status_code == 200:
        no_loc_searches = response.json()
    else:
        no_loc_searches = 'Status code: ' + str(response.status_code)

    return no_loc_searches

# %% ../../nbs/03_police_data_api_scrapers.ipynb 17
def get_unique_col_vals(data):
    """
    Takes a json input converts to a dataframe and returns the column titles and unique values.
    """
    data = pd.json_normalize(data)
    u_col_vals = {}
    cols = list(data.columns)
    
    for val in cols:
        if type(data[val][0]) == str:
            # If there are a lot of unique values they're likely a form of id or date so we don't 
            # want them. Here we make sure there is a unique value at least every other case.
            if len(data[val].unique()) >= len(data)*0.5:
                continue  
            if not data[val][0].replace('.','', 1).replace('-','',1).isnumeric():
                u_col_vals[val] = list(data[val].unique())
    
    return u_col_vals