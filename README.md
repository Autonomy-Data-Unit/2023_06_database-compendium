# Database Compendium

<!-- WARNING: THIS FILE WAS AUTOGENERATED! DO NOT EDIT! -->

## Install

``` sh
pip install database_compendium
```

## Requirements

- Python 3.x
- requests library
- pandas library
- BeautifulSoup library
- re (Regular Expression) module
- Math
- numpy

## How to use

The following shows how the functions can be used to collect metadata on
the datasets available from each source.  
- These scripts are aimed at retrieving dataset titles, two descriptions
(long and short), column titles, unique non-numeric column values, and
the release date / date of last update.  
- Titles and descriptions are given as strings, columns as a list, and
unique column values as a dictionary (with the key being the column
title).

### ONS Functions

> ONS functions include: get_ONS_datasets_titles_descriptions(),
> get_ONS_long_description(), get_ONS_datasets_urls(), find_ONS_cols(),
> find_ONS_cols_and_unique_vals().

``` python
from database_compendium.utils.ONS_scraper_functions import *

# Titles and Descriptions
titles, descriptions = get_ONS_datasets_titles_descriptions()

# Long Descriptions
long_description = get_ONS_long_description()

# Dataset URLs which are used to open the dataset and read the column data
urls = get_ONS_datasets_urls()

# Dataset Columns
columns = find_ONS_cols(urls[0])

# Dataset Unique Column Values
unique_column_vals = find_ONS_cols_and_unique_vals(urls[0])

# In this case there isn't a function that gets the date but it can easily be done 
# using the urls as follows
response = requests.get(urls[0], timeout=1)
latest_release = str(response.json()['release_date'])

# Display the output of each function
print('Title: ', titles[0])
print('\nDescription: ', descriptions[0]) 
print('\nLong_description: ', long_description[0][:100])
print('\nColumns: ', columns)
print('\nUnique_parameters: ', unique_column_vals)
print('\nLatest_release: ', latest_release)
```

    Title:  Quarterly personal well-being estimates

    Description:  Seasonally and non seasonally-adjusted quarterly estimates of life satisfaction, feeling that the things done in life are worthwhile, happiness and anxiety in the UK.

    Long_description:  We are currently reviewing the measures of national well-being and will update this page in summer 2

    Columns:  ['v4_2', 'LCL', 'UCL', 'yyyy-qq', 'Time', 'uk-only', 'Geography', 'measure-of-wellbeing', 'MeasureOfWellbeing', 'wellbeing-estimate', 'Estimate', 'seasonal-adjustment', 'SeasonalAdjustment']

    Unique_parameters:  {'v4_2': None, 'LCL': None, 'UCL': None, 'yyyy-qq': ['2017-q2', '2011-q2', '2020-q2', '2016-q4', '2021-q3', '2020-q3', '2014-q3', '2019-q4', '2022-q2', '2021-q1', '2015-q1', '2013-q4', '2022-q4', '2018-q2', '2017-q3', '2020-q1', '2017-q1', '2012-q4', '2021-q4', '2015-q4', '2019-q2', '2022-q1', '2018-q4', '2015-q3', '2014-q2', '2013-q1', '2016-q1', '2022-q3', '2018-q3', '2015-q2', '2019-q1', '2020-q4', '2014-q1', '2014-q4', '2021-q2', '2018-q1', '2013-q3', '2019-q3', '2012-q1', '2011-q3', '2016-q3', '2016-q2', '2012-q3', '2012-q2', '2017-q4', '2013-q2', '2011-q4'], 'Time': ['2017 Q2', '2011 Q2', '2020 Q2', '2016 Q4', '2021 Q3', '2020 Q3', '2014 Q3', '2019 Q4', '2022 Q2', '2021 Q1', '2015 Q1', '2013 Q4', '2022 Q4', '2018 Q2', '2017 Q3', '2020 Q1', '2017 Q1', '2012 Q4', '2021 Q4', '2015 Q4', '2019 Q2', '2022 Q1', '2018 Q4', '2015 Q3', '2014 Q2', '2013 Q1', '2016 Q1', '2022 Q3', '2018 Q3', '2015 Q2', '2019 Q1', '2020 Q4', '2014 Q1', '2014 Q4', '2021 Q2', '2018 Q1', '2013 Q3', '2019 Q3', '2012 Q1', '2011 Q3', '2016 Q3', '2016 Q2', '2012 Q3', '2012 Q2', '2017 Q4', '2013 Q2', '2011 Q4'], 'uk-only': ['K02000001'], 'Geography': ['United Kingdom'], 'measure-of-wellbeing': ['anxiety', 'worthwhile', 'happiness', 'life-satisfaction'], 'MeasureOfWellbeing': ['Anxiety', 'Worthwhile', 'Happiness', 'Life satisfaction'], 'wellbeing-estimate': ['poor', 'very-good', 'good', 'average-mean', 'fair'], 'Estimate': ['Poor', 'Very good', 'Good', 'Average (mean)', 'Fair'], 'seasonal-adjustment': ['non-seasonal-adjustment', 'seasonal-adjustment'], 'SeasonalAdjustment': ['Non-seasonally adjusted', 'Seasonally adjusted']}

    Latest_release:  2023-05-12T00:00:00.000Z

### Nomis Functions

> Nomis functions include: get_nomis_datasets_titles_descriptions(),
> get_nomis_dataset_parameters(), and get_nomis_last_updated().

``` python
from database_compendium.utils.Nomis_scraper_functions import *

# Titles, Descriptions, and long Descriptions
titles, descriptions, l_descriptions = get_nomis_datasets_titles_descriptions()

# Unfortunately the Nomis api doesn't currently have a way of collecting columns from a dataset without specifying parameters 
# before hand. I use a blank array so the data fits in a combined dataframe with the data from other sources.
cols = np.empty(len(titles))

# Dataset Unique parameters
params = get_nomis_datasets_parameters()

# Most recent release date
latest_release = get_nomis_last_updated()
```

### Insolvency Functions

> The insolvency statistics are released as an excel file once a month,
> this means most of there are fewer functions as almost all the data
> needed is in said file. Functions include: get_insolvency_stats(),
> get_mis_description(), and get_mis_last_updated().

``` python
from database_compendium.utils.insolvency_stats_scrapers import *

# Insolvency stats are given as a dictionary of dataframes where the key is the dataset title
insolvency_stats, long_desc = get_insolvency_stats()
titles = list(insolvency_stats.keys())

# The descriptions and latest releases are all the same
description = get_mis_description()
latest_release = get_mis_last_updated()

# Dataset columns and unique column values
cols = list(insolvency_stats[titles[0]].columns)
col_data = get_insolvency_unique_column_vals(insolvency_stats[titles[0]])
```

### Police Data Functions

> The police data is a bit more awkward as it requires either a latitude
> and longitude or a poly-area which is made up of latitude and
> longitude pairs. In an attempt to make things easier the
> get_constituency_coordinates() function was added which returns a
> dictionary containing every westminster parliamentary constituency and
> four coordinates as a very low res poly-area. For those with no
> location, the search is done by police force. Functions include:
> get_constituency_coordinates(), get_street_level_crimes(),
> get_crimes_no_loc(), get_searches_no_loc.

``` python
from database_compendium.utils.police_data_scrapers import *

# Coordinates for all constituencies (UK) - for a list of contituency names use constituency_coords.keys()
constituency_coords = get_constituency_coordinates()

street_level_crimes, sl_last_updated = get_street_level_crimes(constituency_coords['Bethnal Green and Bow'], '2023-03', 'poly')
stop_searches, ss_last_updated = get_stop_searches(constituency_coords['Bethnal Green and Bow'], '2023-03', 'poly')

no_loc_crimes = get_crimes_no_loc('metropolitan', '2023-03')
searches_no_loc = get_searches_no_loc('metropolitan', '2023-03')

# Given a dataset gets unique column values - done individually 
col_data = get_unique_col_vals(street_level_crimes)

# Columns are the keys from the unique column values 
cols = col_data.keys()
```

### NHS Quality and Outcomes

> As with the insolvency stats, this comes as an excel file. Functions
> include: get_NHS_qualityOutcomes(),
> get_qualityOutcomes_uniqueColumnValues

``` python
from database_compendium.utils.NHS_QualityOutcomes_scrapers import *

# Returns dictionary of dataframes.
# The latest release and long description are both the same for all datasets in this file
NHS_quality_outcomes, long_description, latest_release = get_NHS_qualityOutcomes()

# Datasets Titles
titles = list(NHS_quality_outcomes.keys())

sheet = NHS_quality_outcomes[titles[0]]
cols, uniqueParams = get_qualityOutcomes_uniqueColumnValues(sheet)
```

## Notes

These scripts interact with the ONS, Nomis, and Police APIs and various
web pages. Be mindful of their usage to avoid overloading the servers or
violating any terms of use of the APIs.

Remember that web scraping can be subject to changes in the website’s
structure and terms of use. Keep the scripts up-to-date and adapt them
as needed.

Please note that the provided documentation is a general guide based on
the information available in the code snippet. You might need to adjust
the documentation according to the specific needs of your project and
any further developments made to the code.

For more information on the functions and the how the code works check
the functions files.
