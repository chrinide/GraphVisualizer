import networkx as nx
import pandas as pd
import matplotlib.pyplot as plt
from networkx.readwrite import json_graph
import http_server
import json
import flask
import webbrowser


def main():
    #graph_browser()
    webbrowser.open_new_tab('index.html')

def graph_browser(graph=None):
    if graph != None:
        graph_json = json_graph.node_link_data(graph)
        with open('graph_100n_100e_5c_v1.json', 'w') as g:
            json.dump(graph_json, g)

    # Serve the file over http to allow for cross origin requests
    app = flask.Flask(__name__, static_folder="source")

    @app.route('/<path:path>')
    def static_proxy(path):
        return app.send_static_file(path)

    port_num = 8012
    print('\nGo to http://localhost:' + str(port_num) + '/source/index.html to see the example\n')
    app.run(port=port_num)
    http_server.load_url('./source/index.html')

main()
