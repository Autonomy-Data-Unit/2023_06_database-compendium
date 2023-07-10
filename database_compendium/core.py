# AUTOGENERATED! DO NOT EDIT! File to edit: ../nbs/06_matching_columns.ipynb.

# %% auto 0
__all__ = ['find_identical_cols', 'find_similar_cols', 'plot_network']

# %% ../nbs/06_matching_columns.ipynb 3
import pandas as pd
import plotly.express as px
from sklearn.decomposition import PCA
import re
import ast

# %% ../nbs/06_matching_columns.ipynb 8
def find_identical_cols(cols_list, compare_idx):
    """
    Function to find the column titles of datasets that are identical to those
    in the dataset to be compared with.


    The index of the list must be used
    - To find the index of a named dataset we can simply search for the name in 
    the metadata_df and find its corresponding index
    """

    dataset_to_compare = compare_idx

    comp_cols = cols_list[dataset_to_compare]
    comp_cols = [s.strip() for s in comp_cols]
    updated_cols_list = cols_list[:]
    updated_cols_list.pop(dataset_to_compare)

    identical_cols = []
    pattern = re.compile(r"v\d+_\d+") # we want to remove strings in the form vX_Y
    for cl in updated_cols_list:

        # Clean list
        temp_cl = [s.strip() for s in cl]
        temp_cl = [s for s in temp_cl if not pattern.match(s)]

        # Add a list of strings that match from both comp_cols and temp_cl
        identical_cols.append(list(set(comp_cols) & set(temp_cl)))

    return identical_cols

# %% ../nbs/06_matching_columns.ipynb 12
def find_similar_cols(cols_list, compare_idx):
    """
    Function to find the column titles of datasets that are similar to those
    in the dataset to be compared with.


    The index of the list must be used
    - To find the index of a named dataset we can simply search for the name in 
    the metadata_df and find its corresponding index
    """
    similar_columns = [] # stores the lists of similar columns between the dataset being compared and every other dataset
    
    compare_cols = cols_list[compare_idx]
    other_cols_list = cols_list[:]
    other_cols_list.pop(compare_idx)
    
    for i in range(len(other_cols_list)): # looping over the number of datasets
        temp_sim_cls = [] # stores the similar columns between the dataset being compared and another dataset
        for col in compare_cols: # looping over the unique cols for the dataset being compared
            for c in other_cols_list[i]:
                if re.match(r"v\d+_\d+", col): # ignore if it has the form vX_Y
                    continue
                if (textdistance.jaro_winkler(col, c) > 0.9) & (textdistance.jaro_winkler(col, c) != 1):
                    temp_sim_cls.append(c)

        similar_columns.append(temp_sim_cls)
    
    return similar_columns
            

# %% ../nbs/06_matching_columns.ipynb 19
def plot_network(G):
    """ Plot network diagram """
    node_sizes = [min(len(list(G.edges(node)))*8, 12) for node in G.nodes()]
    
    # Set the positions of the nodes
    pos = nx.spring_layout(G)
    
    # Create a list to store the edge traces
    edge_traces = []
    
    # Create an edge trace for each edge with varying width
    for u, v, d in G.edges(data=True):
        x0, y0 = pos[u]
        x1, y1 = pos[v]
        width = d['weight']
            
        edge_trace = go.Scatter(
            x=[x0, x1, None],
            y=[y0, y1, None],
            line=dict(width=width, color='gray'),
            hoverinfo='none',
            mode='lines'
        )
        
        edge_traces.append(edge_trace)
    
    # Create a node trace
    node_trace = go.Scatter(
        x=[pos[node][0] for node in G.nodes()],
        y=[pos[node][1] for node in G.nodes()],
        text=[node for node in G.nodes()],
        mode='markers',
        hoverinfo='text',
        marker=dict(
            color='blue',
            size=node_sizes # The size of the node depends on the number of edges connected to it
        )
    )
    
    # Create the network graph figure
    fig = go.Figure(data=edge_traces + [node_trace],
                    layout=go.Layout(
                        title='',
                        showlegend=False,
                        hovermode='closest',
                        margin=dict(b=20, l=5, r=5, t=40),
                        xaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
                        yaxis=dict(showgrid=False, zeroline=False, showticklabels=False)
                    )
                )
    
    # Display the network graph
    fig.layout.height = 750
    fig.show()
