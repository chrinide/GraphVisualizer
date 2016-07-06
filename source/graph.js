console.clear();
var w = window.innerWidth;
var h = window.innerHeight;
var keyc = true,
  keys = true,
  keyt = true,
  keyr = true,
  keyx = true,
  keyd = true,
  keyl = true,
  keym = true,
  keyh = true,
  key1 = true,
  key2 = true,
  key3 = true,
  key0 = true;

var curve_multiplier = 100;
var log_curve_multiplier = 2;
var default_node_color = "#ccc";
var default_link_color = "#888";
var size_multiplier = 1.5;
var base_radius = 14
var node_size = Math.PI * Math.pow(base_radius, 2);
var highlight_node_size = Math.PI * Math.pow(base_radius*size_multiplier, 2);
var nominal_text_size = 5;
var highlight_text_size = nominal_text_size*size_multiplier;
var max_text_size = 24;
var nominal_stroke = 1.5;
var highlight_stroke = 3;
var max_stroke = 4.5;
var max_base_node_size = 36;
var min_zoom = 0.1;
var max_zoom = 7;
var svg = d3.select("body").append("svg");
var zoom = d3.behavior.zoom().scaleExtent([min_zoom, max_zoom])
var g = svg.append("g");
svg.style("cursor", "move");

var node_stroke_color = "black";
var highlight_node_stroke_color = "black";
var highlight_trans = 0.1;
  var tocolor = "fill";
  var towhite = "stroke";
  if (outline) {
    tocolor = "stroke"
    towhite = "fill"
  }

var focus_node = null,
  highlight_node = null;
var text_center = false;
var outline = false;

function node_color(n) {
  var colors = ["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"];
  return colors[n % colors.length];}

//var node_color = d3.scale.linear().domain([1, 2, 3, 4, 5]).range(["lightcyan", "violet", "lightgreen", "gold", "tomato"]);

var link_color = d3.scale.ordinal()
  .domain(["IP", "email", "phone"])
  .range(["blue", "green", "red"]);

var size = d3.scale.pow().exponent(1)
  .domain([1, 100])
  .range([8, 24]);

var force = d3.layout.force()
  .linkDistance(150)
  .charge(-500)
  .size([w, h]);

//Read the data from the mis element
var mis = document.getElementById('mis').innerHTML;
graph = JSON.parse(mis);
//d3.json("../data/graph_100n_100e_5c_v1.json", function(error, graph) {
//console.log(graph);
/////////////////////////////START OF GRAPH CODE//////////////////////////////////////

//console.log(d3.keys(graph.nodes[0]));
var node_headers = d3.keys(graph.nodes[0]);
var link_headers = d3.keys(graph.links[0]);
var original_graph = graph;


var linkedByIndex = {};
graph.links.forEach(function(d) {
  linkedByIndex[d.source + "," + d.target] = true;
});

function isConnected(a, b) {
  return linkedByIndex[a.index + "," + b.index] || linkedByIndex[b.index + "," + a.index] || a.index == b.index;
}

function hasConnections(a) {
  for (var property in linkedByIndex) {
    s = property.split(",");
    if ((s[0] == a.index || s[1] == a.index) && linkedByIndex[property]) return true;
  }
  return false;
}

//sort links by source, then target
graph.links.sort(function(a,b) {
    if (a.source > b.source) {return 1;}
    else if (a.source < b.source) {return -1;}
    else {8
        if (a.target > b.target) {return 1;}
        if (a.target < b.target) {return -1;}
        else {return 0;}
    }
});

//any links with duplicate source and target get an incremented 'linknum'
for (var i=0; i<graph.links.length; i++) {
    if (i != 0 &&
        graph.links[i].source == graph.links[i-1].source &&
        graph.links[i].target == graph.links[i-1].target) {
            graph.links[i].linknum = graph.links[i-1].linknum + 1;
        }
    else {graph.links[i].linknum = 1;};
};

force
  .nodes(graph.nodes)
  .links(graph.links)
  .start();

var link = g.selectAll(".link")
  .data(graph.links)
  .enter().append("path")
  .attr({
    "class": "link",
    'fill-opacity':0,
    'id': function(d,i) {return 'link'+i},

    })
  .style("stroke-width", nominal_stroke)
  .style("stroke", function(d) {return link_color(d.type);})

var linktext = g.selectAll(".linktext")
  .data(graph.links)
  .enter()
  .append('text')
  .style("pointer-events", "none")
  .attr({'class':'linktext',
         'id':function(d,i){return 'linktext'+i},
         'dx': 75,
         'dy': 6,
         'font-size': nominal_text_size + "px",
         'fill':'black'});

linktext.append('textPath')
  .attr("text-anchor", "middle")
  .attr('xlink:href',function(d,i) {return '#link'+i})
  .style("pointer-events", "none")
  .text(function(d){return d.type});

//node tooltip text
link.append("title")
  .text(function(d) {
    var link_info = "";
    for (i = 0; i < link_headers.length; i++) {
      if (link_headers[i] != "target" && link_headers[i] != "source" && link_headers[i] != "key"){
     	 	var attr_line = link_headers[i] + ": " + d[link_headers[i]];
      		link_info += attr_line;
      	if (i != link_headers.length - 1){link_info += "\n";};
      	};
      };
    return link_info;
    });

// link tooltip
link.on("mouseover", function(d) {
	console.log("mouseover on link");
  svg.style("cursor", "pointer");
  link.style("stroke-width", function(o) { return o == d ? highlight_stroke : nominal_stroke;});
  linktext.style("font-weight", function(o) { return o == d ? "bold" : "normal";});
  })
  .on("mouseout", function(d) {
	console.log("mouseover on link");
  svg.style("cursor", "pointer");
  link.style("stroke-width", nominal_stroke);
  linktext.style("font-weight", "normal");
  });

var node = g.selectAll(".node")
  .data(graph.nodes)
  .enter().append("g")
  .attr({"class": "node", "id": function(d){return d.id}})
  .call(force.drag);


var circle = node.append("path")
  .attr("d", d3.svg.symbol()
        .size(node_size)
        .type(function(d) {return d.type;}))
  .style("fill", function(d) {return node_color(d.Cluster);})
  .style("stroke-width", nominal_stroke)
  .style("stroke", node_stroke_color);

var text = g.selectAll(".text")
    .data(graph.nodes)
    .enter().append("text")
    .attr("dy", ".35em")
    .attr("dx", 0)
    .style("font-size", nominal_text_size + "px")
    .attr('xlink:href',function(d,i) {return '#linkpath'+i})
    text.text(function(d) {return d.id;})
        .style("text-anchor", "middle");

//node tooltip text
node.append("title")
  .text(function(d) {
    var node_info = "";
    for (i = 0; i < node_headers.length; i++) {
      var attr_line = node_headers[i] + ": " + d[node_headers[i]];
      node_info += attr_line;
      if (i != node_headers.length - 1){node_info += "\n";};
      };
    return node_info;
    });

node.on("dblclick.zoom", function(d) {
  d3.event.stopPropagation();
  var dcx = (window.innerWidth / 2 - d.x * zoom.scale());
  var dcy = (window.innerHeight / 2 - d.y * zoom.scale());
  zoom.translate([dcx, dcy]);
  g.attr("transform", "translate(" + dcx + "," + dcy + ")scale(" + zoom.scale() + ")");
});

node.on("mouseover", function(d) {
  set_highlight(d);
})
  .on("mousedown", function(d) {
    d3.event.stopPropagation();
    focus_node = d;
    set_focus(d);
    if (highlight_node === null) set_highlight(d);})
  .on("mouseout", function(d) {exit_highlight();});

d3.select(window).on("mouseup", function() {
  if (focus_node !== null) {
    focus_node = null;
    if (highlight_trans < 1) {
      link.style("opacity", 1);
      linktext.style("opacity", 1);
      circle.style("opacity", 1);
      text.style("opacity", 1);
    }
  }
  if (highlight_node === null) exit_highlight();
});

function set_focus(d) {
  if (highlight_trans < 1) {
    circle.style("opacity", function(o) {return isConnected(d, o) ? 1 : highlight_trans;})
      .style("stroke-width", function(o) {return isConnected(d, o) ? highlight_stroke : nominal_stroke;});
    circle.attr("d", d3.svg.symbol().size(function(o) {return isConnected(d, o) ? highlight_node_size: node_size;}));
    text.style("opacity", function(o) {return isConnected(d, o) ? 1 : highlight_trans;})
      .style("font-size", function(o) {return isConnected(d, o) ? highlight_text_size + "px" : nominal_text_size + "px";});
    link.style("opacity", function(o) { return o.source.index == d.index || o.target.index == d.index ? 1 : highlight_trans;});
    linktext.style("opacity", function(o) { return o.source.index == d.index || o.target.index == d.index ? 1 : highlight_trans;});
  }
}

function set_highlight(d) {
  svg.style("cursor", "pointer");
  if (focus_node !== null) d = focus_node;
  highlight_node = d;
  circle.style("stroke", function(o) {return isConnected(d, o) ? highlight_node_stroke_color : node_stroke_color;})
    .style("stroke-width", function(o) {return isConnected(d, o) ? highlight_stroke : nominal_stroke;});
  circle.attr("d", d3.svg.symbol().size(function(o) {return isConnected(d, o) ? highlight_node_size: node_size;}));
  text.style("font-weight", function(o) {return isConnected(d, o) ? "bold" : "normal";})
    .style("font-size", function(o) {return isConnected(d, o) ? highlight_text_size + "px" : nominal_text_size + "px";});
  text.attr("dy", ".40em");
  link.style("stroke-width", function(o) { return o.source.index == d.index || o.target.index == d.index ? highlight_stroke : nominal_stroke;});
  linktext.style("font-weight", function(o) { return o.source.index == d.index || o.target.index == d.index ? "bold" : "normal";});
}

function exit_highlight() {
  highlight_node = null;
  if (focus_node === null) {
    svg.style("cursor", "move");
    link.style("opacity", 1)
      .style("stroke-width", nominal_stroke);
    linktext.style("font-weight", "normal")
      .style("opacity", 1);
    circle.style("stroke", node_stroke_color)
      .style("stroke-width", nominal_stroke)
      .style("opacity", 1);
    circle.attr("d", d3.svg.symbol().size(node_size));
    text.style("font-weight", "normal")
      .style("opacity", 1)
      .style("font-size", nominal_text_size);
    text.attr("dy", ".35em");
  }
}

zoom.on("zoom", function() {
  var stroke = nominal_stroke;
  if (nominal_stroke * zoom.scale() > max_stroke) stroke = max_stroke / zoom.scale();
  //link.style("stroke-width", stroke);
  //circle.style("stroke-width", stroke);
  var base_radius = node_size;
  if (node_size * zoom.scale() > max_base_node_size) base_radius = max_base_node_size / zoom.scale();
  //circle.attr("d", d3.svg.symbol().size(node_size).type(function(d) {return d.type;}));
  //text.attr("dx", 0);
  var text_size = nominal_text_size;
  if (nominal_text_size * zoom.scale() > max_text_size) text_size = max_text_size / zoom.scale();
  //text.style("font-size", text_size + "px");
  g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");});

svg.call(zoom);

resize();
//window.focus();
d3.select(window).on("resize", resize).on("keydown", keydown);

//console.log(JSON.stringify(graph.links));

force.on("tick", function() {

  node.attr("transform", function(d) {
    return "translate(" + d.x + "," + d.y + ")";});
  text.attr("transform", function(d) {
    return "translate(" + d.x + "," + d.y + ")";});

  link.attr("x1", function(d) {return d.source.x;})
    .attr("y1", function(d) {return d.source.y;})
    .attr("x2", function(d) {return d.target.x;})
    .attr("y2", function(d) {return d.target.y;});

  node.attr("cx", function(d) {return d.x;})
    .attr("cy", function(d) {return d.y;});

  link.attr('d', function(d) {if(d.linknum == 1){var dr = 0; return "M" + d.source.x + " " + d.source.y + " A" + dr + " " + dr + " 0 " + 0 + " " + d.linknum%2 +  " " + d.target.x + " " + d.target.y;}else{var dr = 120 - 10*(d.linknum - d.linknum%2); return "M" + d.source.x + " " + d.source.y + " A" + dr + " " + dr + " 0 " + 0 + " " + d.linknum%2 +  " " + d.target.x + " " + d.target.y;}});

  linktext.attr('transform',function(d,i){
  if (d.target.x<d.source.x){
      bbox = this.getBBox();
      rx = bbox.x+bbox.width/2;
      ry = bbox.y+bbox.height/2;
      return 'rotate(180 '+rx+' '+ry+')';}
    else {return 'rotate(0)';}});});

function resize() {
  var width = window.innerWidth,
      height = window.innerHeight;
  svg.attr("width", width).attr("height", height);

  force.size([force.size()[0] + (width - w) / zoom.scale(), force.size()[1] + (height - h) / zoom.scale()]).resume();
  w = width;
  h = height;
}
//////////////// NODE SEARCH BAR FUNCTIONALITY////////////

var optArray = [];
for (var i = 0; i < graph.nodes.length - 1; i++) {
  optArray.push(graph.nodes[i].id);
}
optArray = optArray.sort();
/*
//autocomplete functionality for search bar *broken*
$(function() {
  $("#search").autocomplete({
    source: optArray
  });
});
*/

function searchNode() {
  //find the node
  var selectedVal = document.getElementById('search').value;
  var column_index = 0;
  for (i = 0; i < node_headers.length; i++) {
  	var column_name = node_headers[i];
  	console.log("node_header[" + i + "]=", column_name);
  	var colType = selectedVal.search(column_name);
    console.log("start position:", colType);
  	if (colType == 0) {
    	var column_index = i;
      selectedVal = selectedVal.slice(column_name.length + 2);
      console.log("attribute specified!");
      break;
      }
    else {
    console.log("attribute specification must be at the beginning, separated by a colon e.g. name:JmURUKjgmDrY. default search is by the first column.");
    	};
    };
  if (selectedVal == "none") {node.style("stroke", "white").style("stroke-width", "1");}
  else {
    //var column_index = 2;
    console.log("column_index=", column_index);
    circle.style("opacity", function(o) {return o[node_headers[column_index]] ==selectedVal ? 1 : highlight_trans;})
      .style("stroke-width", function(o) {return o[node_headers[column_index]] ==selectedVal ? highlight_stroke : nominal_stroke;});
    circle.attr("d", d3.svg.symbol().size(function(o) {return o[node_headers[column_index]] ==selectedVal ? highlight_node_size: node_size;}));
    text.style("opacity", function(o) {return o[node_headers[column_index]] == selectedVal? 1 : highlight_trans;})
    		.style("font-weight", function(o) {return o[node_headers[column_index]] == selectedVal || o[node_headers[column_index]] == selectedVal ? "bold" : "normal";})
      .style("font-size", function(o) {return o[node_headers[column_index]] == selectedVal ? highlight_text_size + "px" : nominal_text_size + "px";});
    if(node_headers[column_index] == "Cluster"){
   	  link.style("opacity", function(o) {return o.source[node_headers[column_index]] == selectedVal || o.target[node_headers[column_index]] == selectedVal ? 1 : highlight_trans;})
      		.style("stroke-width", function(o) {return o.source[node_headers[column_index]] == selectedVal || o.target[node_headers[column_index]] == selectedVal ? highlight_stroke : nominal_stroke;});
  	 linktext.style("opacity", function(o) {return o.source[node_headers[column_index]] == selectedVal || o.target[node_headers[column_index]] == selectedVal ? 1 : highlight_trans;})
     				 .style("font-weight", function(o) {return o.source[node_headers[column_index]] == selectedVal || o.target[node_headers[column_index]] == selectedVal ? "bold" : "normal";});
    }
    else{
   	  link.style("opacity", highlight_trans);
  	 linktext.style("opacity", highlight_trans);
    }
  }
}

////////////////////////////////////////////////////////////////////

function keydown() {
  if (d3.event.keyCode == 32) {
    force.stop();
  } else if (d3.event.keyCode >= 48 && d3.event.keyCode <= 90 && !d3.event.ctrlKey && !d3.event.altKey && !d3.event.metaKey) {
    switch (String.fromCharCode(d3.event.keyCode)) {
      case "C":
        keyc = !keyc;
        break;
      case "S":
        keys = !keys;
        break;
      case "T":
        keyt = !keyt;
        break;
      case "R":
        keyr = !keyr;
        break;
      case "X":
        keyx = !keyx;
        break;
      case "D":
        keyd = !keyd;
        break;
      case "L":
        keyl = !keyl;
        break;
      case "M":
        keym = !keym;
        break;
      case "H":
        keyh = !keyh;
        break;
      case "1":
        key1 = !key1;
        break;
      case "2":
        key2 = !key2;
        break;
      case "3":
        key3 = !key3;
        break;
      case "0":
        key0 = !key0;
        break;
    }

    link.style("display", function(d) {
      var flag = vis_by_type(d.source.type) && vis_by_type(d.target.type) && vis_by_node_score(d.source.score) && vis_by_node_score(d.target.score) && vis_by_link_score(d.score);
      linkedByIndex[d.source.index + "," + d.target.index] = flag;
      return flag ? "inline" : "none";
    });
    node.style("display", function(d) {
      return (key0 || hasConnections(d)) && vis_by_type(d.type) && vis_by_node_score(d.score) ? "inline" : "none";
    });
    text.style("display", function(d) {
      return (key0 || hasConnections(d)) && vis_by_type(d.type) && vis_by_node_score(d.score) ? "inline" : "none";
    });

    if (highlight_node !== null) {
      if ((key0 || hasConnections(highlight_node)) && vis_by_type(highlight_node.type) && vis_by_node_score(highlight_node.score)) {
        if (focus_node !== null) set_focus(focus_node);
        set_highlight(highlight_node);
      } else {
        exit_highlight();
      }
    }
  }
}

function vis_by_type(type) {
  switch (type) {
    case "circle":
      return keyc;
    case "square":
      return keys;
    case "triangle-up":
      return keyt;
    case "diamond":
      return keyr;
    case "cross":
      return keyx;
    case "triangle-down":
      return keyd;
    default:
      return true;
  }
}

function vis_by_node_score(score) {
  if (isNumber(score)) {
    if (score >= 0.666) return keyh;
    else if (score >= 0.333) return keym;
    else if (score >= 0) return keyl;
  }
  return true;
}

function vis_by_link_score(score) {
  if (isNumber(score)) {
    if (score >= 0.666) return key3;
    else if (score >= 0.333) return key2;
    else if (score >= 0) return key1;
  }
  return true;
}

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}
//});

/////////////END OF D3 GRAPH CODE///////////////

/////////////START OF TABLE CODE////////////////

//jsfiddle friendly csv load
//loading table data from csv
var data = d3.csv.parse( d3.select("pre#node_csv").text());

      jsonOutside = graph; // pass json to a global so tableRowClicked has access

      var table = d3.select("#table_container").append("table"),
             thead = table.append("thead"),
             tbody = table.append("tbody");

       // append the header row
       thead.append("tr")
             .selectAll("th")
             .data(node_headers)
             .enter()
             .append("th")
             .text(function (node_headers) { return node_headers; });

         // create a row for each object in the data
        var rows = tbody.selectAll("tr")
             .data(graph.nodes)
             .enter()
             .append("tr")
             .on();


        // create a cell in each row for each column
        var cells = rows.selectAll("td")
             .data(function (row) {return node_headers.map(function (node_headers) {return { column: node_headers, value: row[node_headers] };});})
             .enter()
             .append("td")
             .text(function (d) { return d.value; })
             .on("click", function (d) {
             console.log("row clicked");

             tableRowClicked(d);
             });

function reset() {
    g.selectAll(".active").classed("active", active = false);
    g.transition().duration(750).attr("transform", "");
}

function tableRowClicked(d) {
  var column_index = node_headers.indexOf(d.column);
  circle.style("opacity", function(o) {return o[node_headers[column_index]] ==d.value ? 1 : highlight_trans;})
    .style("stroke-width", function(o) {return o[node_headers[column_index]] ==d.value ? highlight_stroke : nominal_stroke;});
  circle.attr("d", d3.svg.symbol().size(function(o) {return o[node_headers[column_index]] ==d.value ? highlight_node_size: node_size;}));
  text.style("opacity", function(o) {return o[node_headers[column_index]] == d.value? 1 : highlight_trans;})
  		.style("font-weight", function(o) {return o[node_headers[column_index]] == d.value || o[node_headers[column_index]] == d.value ? "bold" : "normal";})
    .style("font-size", function(o) {return o[node_headers[column_index]] == d.value ? highlight_text_size + "px" : nominal_text_size + "px";});
  if(node_headers[column_index] == "Cluster"){
   	link.style("opacity", function(o) {return o.source[node_headers[column_index]] == d.value || o.target[node_headers[column_index]] == d.value ? 1 : highlight_trans;})
        .style("stroke-width", function(o) {return o.source[node_headers[column_index]] == d.value || o.target[node_headers[column_index]] == d.value ? highlight_stroke : nominal_stroke;});
  	linktext.style("opacity", function(o) {return o.source[node_headers[column_index]] == d.value || o.target[node_headers[column_index]] == d.value ? 1 : highlight_trans;})
    				.style("font-weight", function(o) {return o.source[node_headers[column_index]] == d.value || o.target[node_headers[column_index]] == d.value ? "bold" : "normal";});
  }
  else{
   	link.style("opacity", highlight_trans);
  	linktext.style("opacity", highlight_trans);
  }
}
