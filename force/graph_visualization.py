import networkx as nx
import pandas as pd
import matplotlib.pyplot as plt
import json
from networkx.readwrite import json_graph
import http_server
import json
from networkx.readwrite import json_graph

def main():
    graph = import_graph("data/nodes1.csv", "data/edges1.csv")

    # plot graph in matplotlib
    #nx.draw(graph)
    #plt.savefig("/graph_images/demo_graph.png")  # save as png
    #plt.show()  # display graph

    graph_browser(graph)

def import_graph(node_file, edge_file):
    graph = nx.Graph()
    nodeDF = pd.read_csv(node_file)
    #print(nodeDF.dtypes)
    edgeDF = pd.read_csv(edge_file)
    for i in range(len(nodeDF.index)):
        graph.add_node(nodeDF.ix[i, 0], name=nodeDF.ix[i, 1], phone=nodeDF.ix[i, 2], email= nodeDF.ix[i,3], IP=nodeDF.ix[i,4])
    for i in range(len(edgeDF.index)):
        graph.add_edge(edgeDF.ix[i, 0], edgeDF.ix[i, 1], type=edgeDF.ix[i, 2], value=edgeDF.ix[i,3])
    return graph


def graph_browser(graph):
    for n in graph:
        graph.node[n]['name'] = n
    graph_json = json_graph.node_link_data(graph)
    with open('force/force.json', 'w') as g:
        json.dump(graph_json, g)
    http_server.load_url('force/force.html')

main()
