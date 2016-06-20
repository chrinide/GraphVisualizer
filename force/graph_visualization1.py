import networkx as nx
import pandas as pd
import matplotlib.pyplot as plt
import json
from networkx.readwrite import json_graph
import http_server
import json
from networkx.readwrite import json_graph
import flask


def main():
    graph = import_graph("./data/nodes.csv", "./data/edges.csv")
    #plot_graph(graph)
    graph_browser(graph)


def import_graph(node_file, edge_file):
    graph = nx.Graph()
    nodeDF = pd.read_csv(node_file)
    nodeDF = nodeDF.values.tolist()
    #print(nodeDF.dtypes)
    edgeDF = pd.read_csv(edge_file)
    edgeDF = edgeDF.values.tolist()
    print(edgeDF[0][2])
    for i in range(len(nodeDF)):
        graph.add_node(nodeDF[i][0], name=nodeDF[i][1], phone=nodeDF[i][2], email= nodeDF[i][3], IP=nodeDF[i][4], clusterID=nodeDF[i][5])
    for i in range(len(edgeDF)):
        graph.add_edge(edgeDF[i][0], edgeDF[i][1], type=edgeDF[i][2], value=edgeDF[i][3])

    return graph


def plot_graph(graph):
    # plot graph in matplotlib
    nx.draw(graph)
    plt.savefig("graph_images/demo_graph.png")  # save as png
    plt.show()  # display graph

def graph_browser(graph):
    graph_json = json_graph.node_link_data(graph)
    with open('./graph/graph.json', 'w') as g:
        json.dump(graph_json, g)

    #http_server.load_url('./force/force.html')
    #'''
    # Serve the file over http to allow for cross origin requests
    app = flask.Flask(__name__, static_folder="graph")

    @app.route('/<path:path>')
    def static_proxy(path):
        return app.send_static_file(path)

    print('\nGo to http://localhost:8000/graph/graph.html to see the example\n')
    app.run(port=8000)
    http_server.load_url('./graph/graph.html')
    #'''
main()
