import numpy as np
import string
import random
from random import randint
import csv


def main():
    node_num = 1000
    edge_num = 1000
    nodes = create_nodes(node_num)
    edges = create_edges(edge_num, nodes)
    #print("nodes: ", nodes)
    #print("edges: ", edges)
    node_header = ['ID:ID','name:LABEL','name', 'phone#','email','IP','clusterID']
    save_csv('nodes', nodes, header=node_header)
    edge_header = ['ID1:START_ID','ID2:END_ID','type:TYPE','connection']
    save_csv('edges', edges, header=edge_header)


def save_csv(name, array, header = ''):
    with open(name + '.csv', "w", newline='') as f:
        writer = csv.writer(f)
        if header != '':
            writer.writerows([header])
        writer.writerows(array)


def create_nodes(num):
    nodes = list()
    names = list()
    phones = list()
    emails = list()
    IPs = list()
    for i in range(num):
        valid = False
        while not valid:
            name = ''.join(random.choice(string.ascii_letters) for i in range(12))
            phone = randint(1000000000, 9999999999)
            IP = str(randint(0,255)) + '.' + str(randint(0,255)) + '.' + str(randint(0,255))
            #print("name =", name)
            #print("phone =", phone)
            #print("IP =", IP)
            if name not in names:
                names.append((name, name + '@domain.com'))
            if phone not in phones:
                phones.append(phone)
            if IP not in IPs:
                IPs.append(IP)
            valid = True
    #print(names)

    for i in range(num):
        # fields: [id, name, phone#, email, IP, cluster_number]
        name_email = names.pop()
        name = name_email[0]
        email = name_email[1]
        nodes.append([i, name, name, phones.pop(), email, IPs.pop(), randint(1, 10)])
    return nodes


def create_edges(num, nodes):
    edges = list()
    edge_types = ['phone#', 'email', 'IP']
    for i in range(num):
        node1 = nodes[randint(0,999)]
        #print(node1)
        node2 = nodes[randint(0,999)]
        edge = [node1[0], node2[0], edge_types[randint(0,2)]]
        if edge[2] == 'phone#':
            edge.append(node1[3])
        elif edge[2] == 'email':
            edge.append(node1[4])
        elif edge[2] == 'IP':
            edge.append(node1[5])
        edges.append(edge)
    return edges

main()