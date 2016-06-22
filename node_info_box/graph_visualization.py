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
    graph = import_graph("nodes.csv", "edges.csv")
    #plot_graph(graph)
    # graph_browser(graph)
    # graph_browser()


def graph_browser(graph=None):
    if graph != None:
        graph_json = json_graph.node_link_data(graph)
        with open('graph.json', 'w') as g:
            json.dump(graph_json, g)

    # Serve the file over http to allow for cross origin requests
    app = flask.Flask(__name__, static_folder="graph")

    @app.route('/<path:path>')
    def static_proxy(path):
        return app.send_static_file(path)

    port_num = 7999
    print('\nGo to http://localhost:' + str(port_num) + '/graph/index.html to see the example\n')
    app.run(port=port_num)
    http_server.load_url('./graph/index.html')


def import_graph(node_file, edge_file):
    graph = nx.Graph()
    nodeDF = pd.read_csv(node_file)
    nodeDF = nodeDF.values.tolist()
    edgeDF = pd.read_csv(edge_file)
    edgeDF = edgeDF.values.tolist()
    for i in range(len(nodeDF)):
        graph.add_node(nodeDF[i][0], name=nodeDF[i][1], phone=nodeDF[i][2], email= nodeDF[i][3], IP=nodeDF[i][4], clusterID=nodeDF[i][5])
    for i in range(len(edgeDF)):
        graph.add_edge(edgeDF[i][0], edgeDF[i][1], type=edgeDF[i][2], value=edgeDF[i][3])

    return graph


def plot_graph(graph):
    # plot graph in matplotlib
    nx.draw(graph)
    plt.savefig("../graph_images/demo_graph.png")  # save as png
    plt.show()  # display graph

main()
