import numpy as np
import pandas as pd
import string
import random
from random import randint
import csv
from collections import defaultdict

def main():
    node_num = 1000
    edge_num = 1000
    node_header = ['ID', 'name', 'phone','email', 'IP', 'clusterID']
    nodes = create_nodes(node_num)

    edge_header = ['ID1','ID2','type','connection']
    edges = create_edges(nodes[:], edge_num)
    save_csv('nodes4.csv', nodes, header=node_header)
    save_csv('edges4.csv', edges, header=edge_header)


def save_csv(name, array, header=''):
    with open(name, "w", newline='') as f:
        writer = csv.writer(f)
        if header != '':
            writer.writerows([header])
        writer.writerows(array)


def create_nodes(num):
    nodes = list()
    names = list()
    phones = list()
    IPs = list()
    for i in range(num):
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
    for i in range(num):
        name_email = names.pop()
        name = name_email[0]
        email = name_email[1]
        nodes.append([i, name, phones.pop(), email, IPs.pop(), randint(1, 10)])
    return nodes


def create_edges(nodes, num):
    edges = list()
    nodes_used = defaultdict(list)
    edge_types = ['phone', 'email', 'IP']
    for j in range(len(nodes)):
        if nodes:
            node1 = nodes.pop()
        else:
            break
        clusterID = node1[5]
        if clusterID not in nodes_used:
            nodes_used[clusterID].append(node1)
        elif node1 not in nodes_used[clusterID]:
            nodes_used[clusterID].append(node1)
        if len(nodes_used[clusterID]) == 1:
            node2 = sample_by_id(nodes, clusterID)
            nodes.remove(node2)
            nodes_used[clusterID].append(node2)
        else:
            node2 = random.choice(nodes_used[clusterID])
        edge = [node1[0], node2[0], edge_types[randint(0, 2)]]
        if edge[2] == 'phone':
            edge.append(node1[3])
        elif edge[2] == 'email':
            edge.append(node1[4])
        elif edge[2] == 'IP':
            edge.append(node1[5])
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

main()