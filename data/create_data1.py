import numpy as np
import pandas as pd
import string
import random
from random import randint
import csv
from collections import defaultdict
import networkx as nx
from networkx.readwrite import json_graph
import json


def main():
    node_num = 100
    edge_num = 100
    cluster_num = 5
    node_header = ['ID', 'name', 'phone', 'email', 'IP', 'clusterID']
    nodes = create_nodes(node_num, cluster_num)
    edge_header = ['ID1', 'ID2', 'type', 'connection']
    edges = create_edges(nodes[:], edge_num, cluster_num)
    file_tag = '100n_100e_5c_v1'
    save_csv('nodes_'+ file_tag + '.csv', nodes, header=node_header)
    save_csv('edges_'+ file_tag + '.csv', edges, header=edge_header)
    graph = import_graph('nodes_'+ file_tag + '.csv', 'edges_'+ file_tag + '.csv')
    save_json(graph, file_tag)


def save_csv(name, array, header=''):
    with open(name, "w", newline='') as f:
        writer = csv.writer(f)
        if header != '':
            writer.writerows([header])
        writer.writerows(array)


def create_nodes(node_num, cluster_num):
    nodes = list()
    names = list()
    phones = list()
    IPs = list()
    for i in range(node_num):
        valid = False
        while not valid:
            name = ''.join(random.choice(string.ascii_letters) for i in range(12))
            if name not in names:
                names.append((name, name + '@domain.com'))
                valid = True
        valid=False
        while not valid:
            phone = randint(1000000000, 9999999999)
            if phone not in phones:
                phones.append(phone)
                valid = True
        valid=False
        while not valid:
            IP = str(randint(0, 255)) + '.' + str(randint(0, 255)) + '.' + str(randint(0, 255))
            if IP not in IPs:
                IPs.append(IP)
                valid = True
    for i in range(node_num):
        name_email = names.pop()
        name = name_email[0]
        email = name_email[1]
        nodes.append([i, name, phones.pop(), email, IPs.pop(), randint(1, cluster_num)])
    return nodes


def create_edges(nodes, edge_num, cluster_num):
    edges = list()
    nodes_used = defaultdict(list)
    edge_types = ['phone', 'email', 'IP']
    for j in range(edge_num):
        if nodes:
            node1 = nodes.pop()
        else:
            node1 = random.choice(nodes_used[randint(1, cluster_num)])
        clusterID = node1[5]
        if clusterID not in nodes_used:
            nodes_used[clusterID].append(node1)
        elif node1 not in nodes_used[clusterID]:
            nodes_used[clusterID].append(node1)
        while True:
            if len(nodes_used[clusterID]) == 1:
                node2 = sample_by_id(nodes, clusterID)
                nodes.remove(node2)
                nodes_used[clusterID].append(node2)
            else:
                node2 = random.choice(nodes_used[clusterID])
            if node1[0] != node2[0]:
                break
        edge = [node1[0], node2[0], edge_types[randint(0, 2)]]
        if edge[2] == 'phone':
            edge.append(node1[2])
        elif edge[2] == 'email':
            edge.append(node1[3])
        elif edge[2] == 'IP':
            edge.append(node1[4])
        edges.append(edge)
    return edges


def sample_by_id(nodes, clusterID):
    def convert_node_types(node):
        node[0] = int(node[0])
        node[2] = int(node[2])
        node[5] = int(node[5])
        return node
    nodesDF = pd.DataFrame(np.array(nodes))
    nodesDF[5] = nodesDF[5].astype(int)
    nodesDF = nodesDF[nodesDF[5] == clusterID]
    nodesDF = nodesDF.values.tolist()
    node = convert_node_types(nodesDF.pop())
    return node

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

def save_json(graph, file_tag):
    graph_json = json_graph.node_link_data(graph)
    with open('graph_' + file_tag + '.json', 'w') as g:
        json.dump(graph_json, g)

main()
