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

var default_node_color = "#ccc";
var default_link_color = "#888";
var size_multiplier = 1.5;
var base_radius = 10
var node_size = Math.PI * Math.pow(base_radius, 2);
var highlight_node_size = Math.PI * Math.pow(base_radius*size_multiplier, 2);
var nominal_text_size = 10;
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
var node_color = d3.scale.linear()
  .domain([1, 2, 3, 4, 5])
  .range(["lightcyan", "violet", "lightgreen", "gold", "tomato"]);

var link_color = d3.scale.ordinal()
  .domain(["IP", "email", "phone"])
  .range(["blue", "green", "red"]);

var size = d3.scale.pow().exponent(1)
  .domain([1, 100])
  .range([8, 24]);

var force = d3.layout.force()
  .linkDistance(100)
  .charge(-500)
  .size([w, h]);

//Read the data from the mis element
//var mis = document.getElementById('mis').innerHTML;
//graph = JSON.parse(mis);
d3.json("../data/graph_100n_100e_5c_v1.json", function(error, graph) {
//console.log(graph);
/////////////////////////////START OF GRAPH CODE//////////////////////////////////////

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

force
  .nodes(graph.nodes)
  .links(graph.links)
  .start();

var link = g.selectAll(".link")
  .data(graph.links)
  .enter().append("line")
  .attr("class", "link")
  .style("stroke-width", nominal_stroke)
  .style("stroke", function(d) {return link_color(d.type);})


var linkpaths = g.selectAll(".linkpath")
  .data(graph.links)
  .enter()
  .append('path')
  .attr({'d': function(d) {return 'M '+d.source.x+' '+d.source.y+' L '+ d.target.x +' '+d.target.y},
         'class':'linkpath',
         'fill-opacity':0,
         'stroke-opacity':0,
         'fill':'blue',
         'stroke':'red',
         'id':function(d,i) {return 'linkpath'+i}})
  .style("pointer-events", "none");

var linktext = g.selectAll(".linktext")
  .data(graph.links)
  .enter()
  .append('text')
  .style("pointer-events", "none")
  .attr({'class':'linktext',
         'id':function(d,i){return 'linktext'+i},
         'dx':50,
         'dy':10,
         'font-size': nominal_text_size + "px",
         'fill':'black'});

linktext.append('textPath')
  .attr("text-anchor", "middle")
  .attr('xlink:href',function(d,i) {return '#linkpath'+i})
  .style("pointer-events", "none")
  .text(function(d){return d.type});

//node tooltip text
link.append("title")
  .text(function(d) {
  return "communication type: " + d.type + "\n" + "source value: " + d.value;});

link.on("mouseover", function(d) {
	svg.style("cursor", "pointer");
  //d.style("stroke-width", highlight_stroke);
  });

/*
//linktext tooltip text
linktext.append("title")
  .text(function(d) {
  return "source ID: " + d.source + "\n" + "target ID: " + d.target + "\n" + "communication type: " + d.type + "\n" + "source value: " + d.value;});

linktext.on("mouseover", function(d) {
	svg.style("cursor", "pointer");
  //d.style("stroke-width", highlight_stroke);
  });
*/

var node = g.selectAll(".node")
  .data(graph.nodes)
  .enter().append("g")
  .attr("class", "node")
  .call(force.drag);

var circle = node.append("path")
  .attr("d", d3.svg.symbol()
        .size(node_size)
        .type(function(d) {return d.type;}))
  .style("fill", function(d) {return node_color(d.clusterID);})
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
  return  "ID: " + d.id + "\n" + "name: " + d.name + "\n" + "clusterID: " + d.clusterID + "\n" + "phone: " + d.phone + "\n" + "email: " + d.email + "\n" + "IP: " + d.IP;});

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
      .style("stroke-width", nominal_stroke);
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
  link.style("stroke-width", stroke);
  circle.style("stroke-width", stroke);
  var base_radius = node_size;
  if (node_size * zoom.scale() > max_base_node_size) base_radius = max_base_node_size / zoom.scale();
  circle.attr("d", d3.svg.symbol()
    .size(node_size)
    .type(function(d) {return d.type;}));
  text.attr("dx", 0);
  var text_size = nominal_text_size;
  if (nominal_text_size * zoom.scale() > max_text_size) text_size = max_text_size / zoom.scale();
  text.style("font-size", text_size + "px");
  g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");});

svg.call(zoom);

resize();
//window.focus();
d3.select(window).on("resize", resize).on("keydown", keydown);

force.on("tick", function() {

  node.attr("transform", function(d) {
    return "translate(" + d.x + "," + d.y + ")";});
  text.attr("transform", function(d) {
    return "translate(" + d.x + "," + d.y + ")";});

  link.attr("x1", function(d) {
    return d.source.x;})
    .attr("y1", function(d) {
    return d.source.y;})
    .attr("x2", function(d) {return d.target.x;})
    .attr("y2", function(d) {return d.target.y;});

  node.attr("cx", function(d) {return d.x;})
    .attr("cy", function(d) {return d.y;});
  linkpaths.attr('d', function(d) { var path='M '+d.source.x+' '+d.source.y+' L '+ d.target.x +' '+d.target.y;
                                   //console.log(d)
                                   return path});

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

/////////////////////////// NODE SEARCH BAR FUNCTIONALITY////////////////////////////////

var optArray = [];
for (var i = 0; i < graph.nodes.length - 1; i++) {
  optArray.push(graph.nodes[i].id);
}
optArray = optArray.sort();
/*
$(function() {
  $("#search").autocomplete({
    source: optArray
  });
});
*/

function searchNode() {
  //find the node
  var selectedVal = document.getElementById('search').value;
  if (selectedVal == "none") {node.style("stroke", "white").style("stroke-width", "1");}
  else {
  	var search_time = 4000;
    var unselected_nodes = node.filter(function(d) {return d.id != selectedVal;});
    var unselected_text = text.filter(function(d) {return d.id != selectedVal;});
    unselected_nodes.style("opacity", highlight_trans).transition().duration(search_time).style("opacity", 1);
    unselected_text.style("opacity", highlight_trans).transition().duration(search_time).style("opacity", 1);
    //var selected_node = node.filter(function(d) {return d.id === selectedVal;});
    //set_focus(selected_node);
    var link = g.selectAll(".link");
    link.style("opacity", highlight_trans).transition().duration(search_time).style("opacity", 1);
    var linktext = g.selectAll(".linktext");
    linktext.style("opacity", highlight_trans).transition().duration(search_time).style("opacity", 1);
  }
}

//////////////////////////////////////////////////////////////////////////

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

/////////////////END OF D3 GRAPH CODE/////////////START OF TABLE CODE/////////////////////

var jsonOutside;
//loading table data from csv
//var data = d3.csv.parse( d3.select("pre#data").text() );
var data = d3.csv("../data/nodes_100n_100e_5c_v1.csv");
      jsonOutside = graph; // pass json to a global so tableRowClicked has access
      var columns = ["ID","name","phone","email","IP","clusterID"];
       var table = d3.select("#table_container").append("table"),
             thead = table.append("thead"),
             tbody = table.append("tbody");

       // append the header row
       thead.append("tr")
             .selectAll("th")
             .data(columns)
             .enter()
             .append("th")
             .text(function (column) { return column; });

         // create a row for each object in the data
        var rows = tbody.selectAll("tr")
             .data(data)
             .enter()
             .append("tr");

         // create a cell in each row for each column
        var cells = rows.selectAll("td")
             .data(function (row) {
                 return columns.map(function (column) {
                     return { column: column, value: row[column] };
                 });
             })
             .enter()
             .append("td")
             .text(function (d) { return d.value; }
             )
             .on("click", function (d) { tableRowClicked(d); }); // added on click eventto td         element NB you need to click on the cell with the conuty name

        // add extents (max and min) from data results for choropleth
        colScale.domain(d3.extent(data, function (d) { return d.Result; } ));

        //Bind data and create one path per GeoJSON feature
        g.selectAll("path")
           .data(json.features)
           .enter()
           .append("path")
           .attr("d", path)
           .attr("class", "feature")
           .attr("id", function (d) { return d.properties.name; }) // added id so click could work on id which is common between the json and csv data
           .on("click", function (d) { click(d); })
           .style("stroke", "white")
           .style("fill", function (d,i) { return colScale(d.properties.value); }); // fill based on colour scale

        g.append("path")
           .data(json.features)
           .enter()
           .append("path")
           .attr("class", "mesh")
           .attr("d", path);
    //});

//});

function click(d) {

    if (active === d) return reset();
   g.selectAll(".active").classed("active", false);
   d3.select("#"+d.properties.name).classed("active", active = d); // changed selection to id

   var b = path.bounds(d);

   g.transition().duration(750).attr("transform",
       "translate(" + projection.translate() + ")"
       + "scale(" + .95 / Math.max((b[1][0] - b[0][0]) / w, (b[1][1] - b[0][1]) / h) + ")"
       + "translate(" + -(b[1][0] + b[0][0]) / 2 + "," + -(b[1][1] + b[0][1]) / 2 + ")");
}

function reset() {
    g.selectAll(".active").classed("active", active = false);
    g.transition().duration(750).attr("transform", "");
}

function tableRowClicked(x) {

    jsonOutside.features.forEach(function (d) { // loop through json data to match td entry
        if (x.value === d.properties.name) {
            var county = d;
            click(d); // pass json element that matches td data to click
        };
    })
}
});