// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as path from "path";
const fs = require('fs');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
		console.log('Congratulations, your extension is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Show initialze
		vscode.window.showInformationMessage('successfully opened!');


		// Create and show a new webview
		const panel = vscode.window.createWebviewPanel(
			'helloWorld', // Identifies the type of the webview. Used internally
			'Cambricon TestBench Generator', // Title of the panel displayed to the user
			vscode.ViewColumn.One, // Editor column to show the new webview panel in.
			{
				enableScripts: true
			} // Webview options. More on these later.
		
		);

		//Initialize a webview
		panel.webview.html = getWebviewContent();


		//Receive a message-showing command from webview
		panel.webview.onDidReceiveMessage(
			message => {
			  switch (message.command) {
				case 'alert':
				vscode.window.showInformationMessage(message.text);			
				return;
			  }
			},
			undefined,
			context.subscriptions
		  );


		//Receive a message-showing command from webview
		panel.webview.onDidReceiveMessage(
			message => {
			  switch (message.command) {
				case 'warning':
				vscode.window.showWarningMessage(message.text);			
				return;
			  }
			},
			undefined,
			context.subscriptions
		  );


		
		//Receive a file-exporting command from webview
		panel.webview.onDidReceiveMessage(
		message => {
			switch (message.command) {
			case 'NewFile':

			var new_path = message.new_path;

			fs.writeFileSync('' + new_path, message.text, 'utf8');

			var openPath = vscode.Uri.file('' + new_path);

			vscode.workspace.openTextDocument(openPath).then(doc => {
				vscode.window.showTextDocument(doc);
			});				

			return;

			}
		},
		undefined,
		context.subscriptions
		);


		//Receive a file-exporting command from webview
		panel.webview.onDidReceiveMessage(
			message => {
				switch (message.command) {
				case 'NewFolder':

				var new_path = message.new_path;

				fs.mkdirSync("" + new_path);				
						
				return;
	
				}
			},
			undefined,
			context.subscriptions
			);


		//Receive a message-showing command from webview
		panel.webview.onDidReceiveMessage(
			message => {
			  switch (message.command) {
				case 'prompt':

				vscode.window.showInputBox(
					{ // 这个对象中所有参数都是可选参数
						password:false, // 输入内容是否是密码
						ignoreFocusOut:true, // 默认false，设置为true时鼠标点击别的地方输入框不会消失
						placeHolder: message.placeHolder, // 在输入框内的提示信息
						prompt: message.prompt, // 在输入框下方的提示信息
					}).then(function(msg){
					// vscode.window.showInformationMessage("用户输入："+msg);
					var target = message.target;

					panel.webview.postMessage({text: msg, target});
				});

				return;
			  }
			},
			undefined,
			context.subscriptions
		  );


		//Receive a message-showing command from webview
		panel.webview.onDidReceiveMessage(
			message => {
			  switch (message.command) {
				case 'localRead':

				vscode.window.showOpenDialog(
					{ // 可选对象
						canSelectFiles:true, // 是否可选文件
						canSelectFolders:false, // 是否可选文件夹
						// canSelectMany:true, // 是否可以选择多个
						defaultUri:vscode.Uri.file("/home"), // 默认打开本地路径
						openLabel:'Open',
					}).then(function(uri){
						var temp = "" + uri;
						var url = temp.replace("file://","");
						var div = fs.readFileSync(url,'utf-8');
						panel.webview.postMessage({ text: div, path: url, target: message.target });
					})

				return;
			  }

			},
			undefined,
			context.subscriptions
		  );




		//Receive a message-showing command from webview
		panel.webview.onDidReceiveMessage(
			message => {
			  switch (message.command) {
				case 'localReadDir':

				var filePath = message.path;
				var url_arr = [];

				//调用文件遍历方法
				fileDisplay(filePath);

				/**
				 * 文件遍历方法
				 * @param filePath 需要遍历的文件路径
				 */
				function fileDisplay(filePath: any){
					//根据文件路径读取文件，返回文件列表
					fs.readdir(filePath,function(err: any,files: any){
						if(err){
						console.warn(err)
						}else{
						//遍历读取到的文件列表
						files.forEach(function(filename: any){
							//获取当前文件的绝对路径
							var filedir = path.join(filePath,filename);
							//根据文件路径获取文件信息，返回一个fs.Stats对象
							fs.stat(filedir,function(eror: any,stats: any){
							if(eror){
								// console.warn('获取文件stats失败');
								vscode.window.showErrorMessage("Error when reading dir")
							}else{
								var isFile = stats.isFile();//是文件
								var isDir = stats.isDirectory();//是文件夹
								if(isFile){
								// console.log(filedir);
								// vscode.window.showInformationMessage(filename);

								//get the content of template file
								var text = fs.readFileSync(filedir,'utf-8');

								panel.webview.postMessage({ text: text, name: filename, path: filedir, target: message.target });
								}
								if(isDir){
								fileDisplay(filedir);//递归，如果是文件夹，就继续遍历该文件夹下面的文件
								}
							}
							})
						});
						}
					});
					
					}

				
				return;
			  }


			},
			undefined,
			context.subscriptions
		  );



		  		  
		//Receive a message-showing command from webview
		panel.webview.onDidReceiveMessage(
			message => {
			  switch (message.command) {
				case 'localReadFile':

					var div = fs.readFileSync("" + message.url,'utf-8');
					// if(message.targetComp == "DUT"){
					// vscode.window.showInformationMessage(message.url);
					// }

					panel.webview.postMessage({ text: div, path: message.url, target: message.target, targetComp: message.targetComp });

				return;
			  }

			},
			undefined,
			context.subscriptions
		  );


		//Receive a message-showing command from webview
		panel.webview.onDidReceiveMessage(
			message => {
			  switch (message.command) {
				case 'localSave':

				vscode.window.showSaveDialog(
					{ // 可选对象
						// canSelectFiles:true, // 是否可选文件
						// canSelectFolders:false, // 是否可选文件夹
						// canSelectMany:true, // 是否可以选择多个
						defaultUri:vscode.Uri.file("/home"), // 默认打开本地路径
						saveLabel:'Open & Name'
					}).then(function(uri){
						var temp = "" + uri;
						var url = temp.replace("file://","");
						panel.webview.postMessage({ path: url, target: message.target });
					})

				return;
			  }

			},
			undefined,
			context.subscriptions
		  );



	});




	context.subscriptions.push(disposable);
}




function getWebviewContent() {


	return ` 
	
	<!DOCTYPE html>
	<html>
	<head>
	  <meta charset="UTF-8">
	  <title>Dynamic Ports</title>

	  <h1>Cambricon TestBench Generator</h1>

	  <meta name="description" content="Nodes with varying lists of ports on each of four sides." />
	  <meta name="viewport" content="width=device-width, initial-scale=1">
	  <!-- Copyright 1998-2019 by Northwoods Software Corporation. -->
	
	  <script src="https://cdn.jsdelivr.net/npm/gojs/release/go.js"></script>
	  <!-- <script src="http://10.101.6.13:9013/gojs/go.js"></script> -->

	  <script id="code">
		function init() {

		vscode = acquireVsCodeApi();


		  if (window.goSamples) goSamples();  // init for these samples -- you don't need to call this
		  var $ = go.GraphObject.make;  //for conciseness in defining node templates
		  myDiagram =
			$(go.Diagram, "myDiagramDiv",  //Diagram refers to its DIV HTML element by id
			  { "undoManager.isEnabled": true}
			  
			  );
		  // when the document is modified, add a "*" to the title and enable the "Save" button
		  myDiagram.addDiagramListener("Modified", function(e) {
			var button = document.getElementById("SaveButton");
			if (button) button.disabled = !myDiagram.isModified;
			var idx = document.title.indexOf("*");
			if (myDiagram.isModified) {
			  if (idx < 0) document.title += "*";
			} else {
			  if (idx >= 0) document.title = document.title.substr(0, idx);
			}
		  });
	
	
	 //Initialized nodes, groups, ports, and links
	 myDiagram.model = $(go.GraphLinksModel,
	 {
	  "copiesArrays": true,
	  "copiesArrayObjects": true,
	  "linkFromPortIdProperty": "fromPort",
	  "linkToPortIdProperty": "toPort",
	  nodeDataArray: [

		{"loc":"116.5 4.0752929687499915", "key":1, "name":"Reference Model", "type":"Reference Model", "leftArray":[], "topArray":[], "bottomArray":[], "rightArray":[], "adArray":[], "trArray":[], "color":"CornflowerBlue", "width":124.50000000000001, "height":50, "group":5},
		{"loc":"372.5 2.0752929687499915", "key":2, "name":"Scoreboard", "type":"Scoreboard", "leftArray":[], "topArray":[], "bottomArray":[], "rightArray":[], "adArray":[], "trArray":[], "color":"CornflowerBlue", "width":100, "height":50, "group":5},
		{"loc":"97 115.15058593749998", "key":3, "name":"Sequencer", "type":"Sequencer", "leftArray":[], "topArray":[], "bottomArray":[], "rightArray":[], "adArray":[], "trArray":[], "color":"CornflowerBlue", "width":74.7, "height":50, "group":8},
		{"loc":"167 115.15058593749998", "key":4, "name":"Driver", "type":"Driver", "leftArray":[], "topArray":[], "bottomArray":[], "rightArray":[], "adArray":[], "trArray":[], "color":"CornflowerBlue", "width":50, "height":50, "group":8},
		{"loc":"97 185.15058593749998", "key":6, "name":"Monitor", "type":"Monitor", "leftArray":[], "topArray":[], "bottomArray":[], "rightArray":[], "adArray":[], "trArray":[], "color":"CornflowerBlue", "width":58.10000000000001, "height":50, "group":8},
		{"loc":"362.052978515625 149.15058593749998", "key":7, "name":"Monitor", "type":"Monitor", "leftArray":[], "topArray":[], "bottomArray":[], "rightArray":[], "adArray":[], "trArray":[], "color":"CornflowerBlue", "width":58.10000000000001, "height":50, "group":9},
		{"loc":"225 333", "key":10, "name":"DUT", "type":"DUT", "leftArray":[], "topArray":[], "bottomArray":[], "rightArray":[], "adArray":[], "trArray":[], "color":"CornflowerBlue", "width":100, "height":50},
		{"key":5, "name":"Env", "color":"green", "isGroup":true, "type":"Env", "leftArray":[], "topArray":[], "bottomArray":[], "rightArray":[], "group":"Original"},
		{"key":8, "name":"In_Agent", "color":"green", "isGroup":true, "type":"agent", "group":5, "leftArray":[], "topArray":[], "bottomArray":[], "rightArray":[]},
		{"key":9, "name":"Out_Agent", "color":"green", "isGroup":true, "type":"agent", "group":5, "leftArray":[], "topArray":[], "bottomArray":[], "rightArray":[]}
		 

	],
	
	  linkDataArray: [
	  // {"from":10, "to":4, "fromPort":"left0", "toPort":"bottom0"},
	  // {"from":3, "to":1, "fromPort":"top0", "toPort":"left0"},
	  // {"from":1, "to":2, "fromPort":"left0", "toPort":"right1"},
	  // {"from":10, "to":7, "fromPort":"right0", "toPort":"bottom0"},
	  // {"from":7, "to":2, "fromPort":"top0", "toPort":"bottom0"},
	  // {"from":10, "to":6, "fromPort":"left0", "toPort":"bottom0"},
	  ]}
	 );
	
	//----------------------------------------------------------------------------------------------------------------------------------------------
	//-----------------------------------------------------------------------------------------------------------------------------------------------
	
	//Inspector initialization
	var inspector = new Inspector('myInspectorDiv', myDiagram,
			{
			  // allows for multiple nodes to be inspected at once
			  multipleSelection: true,
			  // max number of node properties will be shown when multiple selection is true
			  showSize: 4,
			  // when multipleSelection is true, when showAllProperties is true it takes the union of properties
			  // otherwise it takes the intersection of properties
			  showAllProperties: true,
			  // uncomment this line to only inspect the named properties below instead of all properties on each object:
			  includesOwnProperties: false,
			  properties: {
				// "text": {},
				// key would be automatically added for nodes, but we want to declare it read-only also:
				"key": { readOnly: true, show: Inspector.showIfPresent },
				// color would be automatically added for nodes, but we want to declare it a color also:
				"color": { show: Inspector.showIfPresent, type: 'color' },
				// Comments and LinkComments are not in any node or link data (yet), so we add them here:
				"Comments": { show: Inspector.showIfNode },
				"LinkComments": { show: Inspector.showIfLink },
	
				"isGroup": { show: Inspector.showIfPresent, type:'isGroup' },
				// "flag": { show: Inspector.showIfNode, type: 'checkbox' },
				// "state": {
				//   show: Inspector.showIfNode,
				//   type: "select",
				//   choices: function(node, propName) {
				//     if (Array.isArray(node.data.choices)) return node.data.choices;
				//     return ["one", "two", "three", "four", "five"];
				//   }
				// },
				// "choices": { show: false },  // must not be shown at all
				// // an example of specifying the <input> type
				// "password": { show: Inspector.showIfPresent, type: 'password' },
	
				"name":{ show: Inspector.showIfPresent, type: "name"},
				"type": { show: Inspector.showIfPresent, type:'type' },
				"trans": { show: Inspector.showIfLink, type:'trans' },
				"isGroup": { show: Inspector.showIfPresent, type:'isGroup' },

				// "width":{ show: Inspector.showIfNode },
				// "height":{  show: Inspector.showIfNode },
				// "loc":{ show: Inspector.showIfNode},
				// "group":{ show: Inspector.showIfPresent, type: "group"},
	
				"from":{ show: Inspector.showIfPresent, type: "from"},
				"to":{ show: Inspector.showIfPresent, type: "to"},
				"fromPort":{ show: Inspector.showIfPresent, type: "fromPort"},
				"toPort":{ show: Inspector.showIfPresent, type: "toPort"}
			  }
			});
	
	//----------------------------------------------------------------------------------------------------------------------------------------------
	//----------------------------------------------------------------------------------------------------------------------------------------------

	//Helper Functions
	//___________________________________________________________________________________
	// Define the appearance and behavior for Groups:
	function groupInfo(adornment) {  // takes the tooltip, not a group node data object
	  var g = adornment.adornedPart;  // get the Group that the tooltip adorns
	  var mems = g.memberParts.count;
	  var links = 0;
	  g.memberParts.each(function(part) {
	  if (part instanceof go.Link) links++;
		  });
		  return "Group " + g.data.key + ": " + g.data.text + " \                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      n " + mems + " members including " + links + " links";
		}
	//____________________________________________________________________________________
	//returns an array of all nodes & groups inside the parameter group
	function inside_nodes(d)
	{
	  var in_nodes = [];
	  // while(myDiagram.model.findNodeDataForKey(i).group==d.key)
	  // {
	  //   in_nodes.push(myDiagram.model.findNodeDataForKey(i).name);
	  //   i++;
	
	  // }
	
	  for(var i = 1; i<key_num; i++)
	  {
		if(myDiagram.model.findNodeDataForKey(i).group==d.key)
		{
		  in_nodes.push(myDiagram.model.findNodeDataForKey(i).name);
		}
	  }
	  return in_nodes;
	}
	//___________________________________________________________________________________
	//initialize a new node
	var i_c = 1;
	while(myDiagram.model.findNodeDataForKey(i_c) != null)
	{
		i_c++;
	}
	key_num = i_c + 1;
	

	function iniNode(d,comp_type)
	  {
		key_num++;
	
		myDiagram.model.addNodeData(
		{
		  "key": key_num, 
		  "name": comp_type + key_num, 
		  "loc": d.loc,
		  "leftArray":[ ],
		  "topArray":[ ],
		  "bottomArray":[ ],
		  "rightArray":[ ],
		   color:"CornflowerBlue", width:50, height:50,
		   adArray:[ ],      //adornment changes
		   trArray:[ ],
		   group: d.key,
		   type: comp_type
		}           
		);

	  }

	//____________________________________________________________________________________
	// Function: initialize an interface
	// Initialize an interface with rotating color and a top port for instantiating purpose
	// interface_num = 0;     //adornment changes

	function iniInterface()      //adornment changes
	{
		// var c_r_arr = ["purple", "thistle", "seagreen", "tan", "violet", "salmon", "olive", "sienna", "palevioletred"];
		// var color_code = c_r_arr[interface_num];
		// interface_num++;

		var color = go.Brush.randomColor();

		key_num++;

		var abs_key_num = key_num;
		if(key_num <= 0)
		{
			abs_key_num = 0 - key_num;
		}
	


		myDiagram.model.addNodeData(
			{"key":abs_key_num, "name":"default interface", "loc":"100 100",
			"leftArray":[ ],
			"topArray":[ {"portId":"instantiate", "portColor":"blue"} ],
			"bottomArray":[ ],
			"rightArray":[ ],
			type:"Interface",
			color:color, width:60, height:60,
			}           
			);

	}
	//________________________________________________________________________________________
	// Function: initialize a transaction
	// Initialize a transaction with rotating color and a top port for distributing purpose
	// transaction_num = 0;     //adornment changes

	function iniTransaction()      //adornment changes
	{
		// var c_r_arr = ["purple", "thistle", "seagreen", "tan", "violet", "salmon", "olive", "sienna", "palevioletred"];
		// var color_code = c_r_arr[8-transaction_num];
		// transaction_num++;

		var color = go.Brush.randomColor();

		var abs_key_num = key_num;
		if(key_num <= 0)
		{
			abs_key_num = 0 - key_num;
		}
	
		key_num++;
		myDiagram.model.addNodeData(
			{"key":abs_key_num, "name":"default transaction", "loc":"100 100",
			"leftArray":[ ],
			"topArray":[ {"portId":"transaction specific", "portColor":"red"} ],
			"bottomArray":[ ],
			"rightArray":[ ],
			color:color, width:120, height:30,
			}           
			);

	}
	//________________________________________________________________________________________
	// Function: initialize a group
	// Initialize a group inside the given group with name "Edit"
	//initialize a new group
	function iniGroup(d,group_type)
	  {
		key_num++;

		var abs_key_num = key_num;
		if(key_num <= 0)
		{
			abs_key_num = 0 - key_num;
		}
	
		
		var name = "Agent";
		if(group_type == "Env")
		{
			name = "Env";
		}
		myDiagram.model.addNodeData(
		{ key: abs_key_num, 
		  name: name, 
		  color: "green", 
		  isGroup: true, 
		  group: d.key,
		  type: group_type,
		  "topArray":[ ],
		  "bottomArray":[ ],
		  "rightArray":[ ],
		  "leftArray":[ ],
		   width:75, height:75,
		}        
	
	  );
	  }
	//_______________________________________________________________________________________
	// Function: set the type of ports
	// Set the ports 
	function setType(d,in_type)		
	{
	  var from_i, from_s;
	  var to_i, to_s;
	  f_node = myDiagram.model.findNodeDataForKey(d.from);
	  t_node = myDiagram.model.findNodeDataForKey(d.to);
	
	  //find which port formPort is
	  arr = determine_port(d.fromPort,d.from);
	  from_i = arr[0];
	  from_s = arr[1];
	  arr = determine_port(d.toPort,d.to);
	  to_i = arr[0];
	  to_s = arr[1];
	
	  //allocate input type
	  var type = in_type;
	
	  // //allocate default type in case without an input
	  // type = "fifo";
	  allocate_type(f_node,t_node,from_s,from_i,d.fromPort,to_s,to_i,d.toPort,type);
	  
	  d.name = type;

	  if(type == "point to")
	  {
		myDiagram.model.setDataProperty(d, 'color', "red");
	  }
	  else if(type == "fifo")
	  {
		myDiagram.model.setDataProperty(d, 'color', "orange");
	  }
	  else if(type == "send receive")
	  {
		myDiagram.model.setDataProperty(d, 'color', "#7FFF00");
	  }
	  
	}
	//____________________________________________________________________________________
	function webview_alert(text)
	{	
		vscode.postMessage({ command: 'alert', text: text });
	}
	//____________________________________________________________________________________
	//gives a string with a node's basic info
	function nodeInfo(d) {  // Tooltip info for a node data object
			var str = "NodeKey: " + d.key + "  \\n" + " Name: " + d.name + "  \\n"
			+ " Size: " +"(" + d.width + ", " +  d.height + ")  \\n"
			+ "Type: " + d.type;
			return str;
		  }
	//_____________________________________________________________________________________
	//gives a string with a link's basic info
	function linkInfo(d) {  // Tooltip info for a node data object
			var str = "From: " + d.fromPort + " of " + d.from  + " \\nTo: " + d.toPort + " of " + d.to + "\\n" 
			+ "Type: " + d.name + " Transaction: " + d.trans;
			return str;
		  }
	//_____________________________________________________________________________________
	// Function: Delete a link
	// Reset the types of ports after a link has been deleted
	function linkDelete(d)
	{
	  var from_i, from_s;
	  var to_i, to_s;
	  f_node = myDiagram.model.findNodeDataForKey(d.from);
	  t_node = myDiagram.model.findNodeDataForKey(d.to);
	
	  //find which port formPort is
	  arr = determine_port(d.fromPort,d.from);
	  from_i = arr[0];
	  from_s = arr[1];
	  arr = determine_port(d.toPort,d.to);
	  to_i = arr[0];
	  to_s = arr[1];

	  //reset all properties of 2 ports
	  if(f_node.type != "Agent")
	  {
		if(from_s=="left")
		{
			f_node.leftArray[from_i].portType = "uNdefined"; 
			f_node.leftArray[from_i].portIf = "uNdefined"; 
			f_node.leftArray[from_i].portTrans = "uNdefined"; 
			f_node.leftArray[from_i].portColor = "grey"; 
		}
		if(from_s=="right")
		{
			f_node.rightArray[from_i].portType = "uNdefined"; 
			f_node.rightArray[from_i].portIf = "uNdefined"; 
			f_node.rightArray[from_i].portTrans = "uNdefined"; 
			f_node.rightArray[from_i].portColor = "grey"; 
		}
		if(from_s=="top")
		{
			f_node.topArray[from_i].portType = "uNdefined"; 
			f_node.topArray[from_i].portIf = "uNdefined"; 
			f_node.topArray[from_i].portTrans = "uNdefined"; 
			f_node.topArray[from_i].portColor = "grey"; 
		}
		if(from_s=="bottom")
		{
			f_node.bottomArray[from_i].portType = "uNdefined"; 
			f_node.bottomArray[from_i].portIf = "uNdefined"; 
			f_node.bottomArray[from_i].portTrans = "uNdefined"; 
			f_node.bottomArray[from_i].portColor = "grey"; 
		}
	  }	


	  //reset all properties of 2 ports
	  if(t_node.type != "Agent")
	  {
		if(to_s=="left")
		{
			t_node.leftArray[to_i].portType = "uNdefined"; 
			t_node.leftArray[to_i].portIf = "uNdefined"; 
			t_node.leftArray[to_i].portTrans = "uNdefined"; 
			t_node.leftArray[to_i].portColor = "grey"; 
		}
		if(to_s=="right")
		{
			t_node.rightArray[to_i].portType = "uNdefined"; 
			t_node.rightArray[to_i].portIf = "uNdefined"; 
			t_node.rightArray[to_i].portTrans = "uNdefined"; 
			t_node.rightArray[to_i].portColor = "grey"; 
		}
		if(to_s=="top")
		{
			t_node.topArray[to_i].portType = "uNdefined"; 
			t_node.topArray[to_i].portIf = "uNdefined"; 
			t_node.topArray[to_i].portTrans = "uNdefined"; 
			t_node.topArray[to_i].portColor = "grey"; 
		}
		if(to_s=="bottom")
		{
			t_node.bottomArray[to_i].portType = "uNdefined"; 
			t_node.bottomArray[to_i].portIf = "uNdefined"; 
			t_node.bottomArray[to_i].portTrans = "uNdefined"; 
			t_node.bottomArray[to_i].portColor = "grey"; 
		}

	  }
	
	}
	//____________________________________________________________________________________
	//alters the color of a node
	function change_color(d) {
	
		if(d.color!="pink"){
	
			myDiagram.model.setDataProperty(d, 'color', "pink");
		}
		else
		{
			myDiagram.model.setDataProperty(d, 'color', "CornflowerBlue");
		}
	}
	//______________________________________________________________________________________
	//increase the area of a node
	function expand(d)
	{
		new_h = d.height + 50;
		myDiagram.model.setDataProperty(d, 'height', new_h);
		new_w = d.width + 50;
		myDiagram.model.setDataProperty(d, 'width', new_w);
	}
	//______________________________________________________________________________________
	//decrease the area of a node
	function shrink(d)
	{
		new_h = d.height - 50;
		myDiagram.model.setDataProperty(d, 'height', new_h);
		new_w = d.width - 50;
		myDiagram.model.setDataProperty(d, 'width', new_w);
	}
	//____________________________________________________________________________________________
	//gives the type of a port
	function portType(d)
	{
  		return d.data.portType + "  " + d.data.portId + "  trans: " + d.data.portTrans;     //adornment changes
	}
	//gives the type of a port
	function port_Id(d)
	{
	  return d.data.portId;
	}
	//gives the type of a link
	//______________________________________________________________________________________
	// Function: Set the adornment port
	// Set properties of an adornment port based on what it linked to
	function setAdorn(d,type)     //adornment changes
	{
	  var color = myDiagram.model.findNodeDataForKey(d.from).color;
	  var Id = myDiagram.model.findNodeDataForKey(d.from).name;
	  d.name = "instantiate"


	  if(type == "instantiate")
	  {
		var i = 0;
		while(myDiagram.model.findNodeDataForKey(d.to).adArray[i]!=null)
		{
			if(myDiagram.model.findNodeDataForKey(d.to).adArray[i].portId == d.toPort)
			{
				myDiagram.model.findNodeDataForKey(d.to).adArray[i].portColor = color;
				myDiagram.model.findNodeDataForKey(d.to).adArray[i].portIf = Id;
				myDiagram.model.setDataProperty(d, 'dash_len', [4,4]);
				myDiagram.model.setDataProperty(d, 'color', color);
			}

			i++;
		}
	  }

	  if(type == "transaction")
	  {
		var i = 0;
		while(myDiagram.model.findNodeDataForKey(d.to).trArray[i]!=null)
		{
			if(myDiagram.model.findNodeDataForKey(d.to).trArray[i].portId == d.toPort)
			{
				myDiagram.model.findNodeDataForKey(d.to).trArray[i].portColor = color;
				myDiagram.model.findNodeDataForKey(d.to).trArray[i].portId = Id;
			}
			i++;
		}
	  }

	}
	//_____________________________________________________________________________________________
	// Function: Output the environment
	// Generate the environment based on given address
	// Call the realization functions recursively from the "Original" Env
	function output()
	{	
		//set the root saving path
		window.addEventListener('message', event => {
			var message = event.data;
			// var text = message.text;
			var text = message.path;
			var target = message.target;
			//set wanted path for the machine
			root_path = text;

			if(target == "export")
			{
				vscode.postMessage({ command: 'NewFolder', new_path: "" + root_path });
				// vscode.postMessage({ command: 'alert', text: "set path to: " + root_path });

				root_path2 = root_path + "/rtl";
				vscode.postMessage({ command: 'NewFolder', new_path: "" + root_path2 });

				root_path1 = root_path + "/tb";
				vscode.postMessage({ command: 'NewFolder', new_path: "" + root_path1 });

				cur_path1 = root_path1 + "/testbench";
				vscode.postMessage({ command: 'NewFolder', new_path: "" + cur_path1 });
				cur_path2 = root_path1 + "/testcase";
				vscode.postMessage({ command: 'NewFolder', new_path: "" + cur_path2 });
				cur_path3 = root_path1 + "/testlist";
				vscode.postMessage({ command: 'NewFolder', new_path: "" + cur_path3 });

				vscode.postMessage({ command: 'alert', text: "set path to: " + root_path });

				vscode.postMessage({ command: 'NewFile', new_path: "" + root_path2 + "/DUT.v", text: dut_templ });


				//reset all counters
				driver_num = 0;
				monitor_num = 0;
				agent_num = 0;
				sequencer_num = 0;
				scoreboard_num = 0;
				model_num = 0;
				undefined_num = 0;
				env_num = 0;
				
				point_to_arr = [];

				//convert all GoJS graphical items to self-defined objects
				all2objects();

				//realization starts from env
				var i = 0;
				while(nodesArray[i]!=null)
				{
					if(nodesArray[i].type == "Env" && nodesArray[i].group == "Original")
					{
						nodesArray[i].real(cur_path1);
					}
					i++;

				}
			}


		});

  
	}
	//_____________________________________________________________________________________________
	// Function: Set the transaction port
	// Set the transaction port based on what it is linked to
	function setTransaction(d)
	{	
		window.addEventListener('message', event => {
			var message = event.data;
			var text = message.text;
			//update global user input

			if(message.target == "trans"+ d.from + d.fromPort + d.to + d.toPort)
			{
				d.trans = text;

				var from_i, from_s;
				var to_i, to_s;
				f_node = myDiagram.model.findNodeDataForKey(d.from);
				t_node = myDiagram.model.findNodeDataForKey(d.to);
			
				//find which port formPort is
				var arr = determine_port(d.fromPort,d.from);
				from_i = arr[0];
				from_s = arr[1];
				var arr = determine_port(d.toPort,d.to);
				to_i = arr[0];
				to_s = arr[1];
			
				if(from_s=="left")
				{
				f_node.leftArray[from_i].portTrans = text; 
				}
				if(from_s=="right")
				{
				f_node.rightArray[from_i].portTrans = text; 
				}
				if(from_s=="top")
				{
				f_node.topArray[from_i].portTrans = text; 
				}
				if(from_s=="bottom")
				{
				f_node.bottomArray[from_i].portTrans = text; 
				}
		
				if(to_s=="left")
				{
				t_node.leftArray[to_i].portTrans = text; 
				}
				if(to_s=="right")
				{
				t_node.rightArray[to_i].portTrans = text; 
				}
				if(to_s=="top")
				{
				t_node.topArray[to_i].portTrans = text; 
				}
				if(to_s=="bottom")
				{
				t_node.bottomArray[to_i].portTrans = text; 
				}

				vscode.postMessage({ command: 'alert', text: "set transaction to " + text });
			}

		});

  
	}
	//______________________________________________________________________________________________
	// Function: Set the name of a port
	// Upon initializing a port automatically prompt to ask user to set a name
	// If user choose not to set it manually set it with a counter-generated name
	function setPortName(d,i,side,tempId)
	{
		window.addEventListener('message', event => {
			var message = event.data;
			var text = message.text;
			var count = i;

			if(message.target == "portName" + d.key + d.name + side + count)
			{
				if(side == "top")
				{
					d.topArray[count].portId = text;
				}
				if(side == "bottom")
				{
					d.bottomArray[count].portId = text;
				}
				if(side == "left")
				{
					d.leftArray[count].portId = text;
				}
				if(side == "right")
				{
					d.rightArray[count].portId = text;
				}

				refresh();
				vscode.postMessage({ command: 'alert', text: "a new port " + text + " is added to " +  d.name });
			}

			refresh();

		});
	}
	//_____________________________________________________________________________________________
	// Function: Refresh
	// Move everything to a location then move them back to update UI's properties
	// Detect the length of name & width of all nodes and then automatically change their width to a proper number
	function refresh()
	{
		//move everything then move them back to update UI's ports' colors
		//traverse nodeDataArray
		var i = 0;
		while(myDiagram.model.nodeDataArray[i] != null)
		{
			var a = 200;
			var b = 200;
			var c = myDiagram.model.nodeDataArray[i].loc;

			myDiagram.model.setDataProperty(myDiagram.model.nodeDataArray[i], 'loc', a,b);
			myDiagram.model.setDataProperty(myDiagram.model.nodeDataArray[i], 'loc', c);	

			i++;
		}


		//check the length of every name and resize nodes accordingly
		var i = 0;
		while(myDiagram.model.nodeDataArray[i] != null)
		{
			var nd = myDiagram.model.nodeDataArray[i];
			var name = nd.name;
			var n_len = name.length;
			if(n_len*8.3 > nd.width)
			{
				r_len_w = 8.3*n_len;
				myDiagram.model.setDataProperty(myDiagram.model.nodeDataArray[i], 'width', r_len_w);
				// myDiagram.model.setDataProperty(myDiagram.model.nodeDataArray[i], 'height', r_len_h);
			}
			i++;
		}

	}

	//____________________________________________________________________________________________
	//initialize all naming counters
	driver_num = 0;
	monitor_num = 0;
	agent_num = 0;
	sequencer_num = 0;
	scoreboard_num = 0;
	model_num = 0;
	undefined_num = 0;
	
	point_to_arr = [];

	//all templates
	templates_url = "";
	monitor_templ = "";
	driver_templ = "";
	scoreboard_templ = "";
	model_templ = "";
	top_templ = "";
	agent_templ = "";
	env_templ = "";
	generic_comp_templ = "";
	sequencer_templ = "";
	interface_templ = "";
	transaction_templ = "";
	env_templ = "";
	dut_templ = "";

	revised_templ = [];

	
	//-------------------------------------------------------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------------------------------------------------------
	
		  // To simplify this code we define a function for creating a context menu button:
		  function makeButton(text, action, visiblePredicate) {
			return $("ContextMenuButton",
			  $(go.TextBlock, text),
			  { click: action },
			  // don't bother with binding GraphObject.visible if there's no predicate
			  visiblePredicate ? new go.Binding("visible", "", function(o, e) { return o.diagram ? visiblePredicate(o, e) : false; }).ofObject() : {});
		  }
	
		  //Menus
		  var nodeMenu =  // context menu for each Node
			$("ContextMenu",
			//   makeButton("Copy",
			// 	function(e, obj) { e.diagram.commandHandler.copySelection(); }),
			//   makeButton("Cut",
			// 	function(e, obj) { e.diagram.commandHandler.cutSelection(); }),  
			//   makeButton("Edit",
			// 	function(e, obj) { e.diagram.commandHandler.editTextBlock(); }),
			//   makeButton("Delete",
			// 	function(e, obj) { e.diagram.commandHandler.deleteSelection(); }),
			  makeButton("Recolor",
				function(e, obj) {
					var part = obj.part.adornedPart;
					change_color(part.data);
				}),                   
			  makeButton("Expand",
				function(e, obj) {
					var part = obj.part.adornedPart;
					expand(part.data);
				}),                
			  makeButton("Shrink",
				function(e, obj) {
					var part = obj.part.adornedPart;
					shrink(part.data);
				}),
			  makeButton("Properties",
				function(e, obj) {  // OBJ is this Button
				  var contextmenu = obj.part;  // the Button is in the context menu Adornment
				  var part = contextmenu.adornedPart;  // the adornedPart is the Part that the context menu adorns
				  webview_alert(nodeInfo(part.data));
				}),  
			  makeButton("Export",////////////////////////////////////////////////////////////////////////////////////////////////////////
				function(e, obj) { 
					//prompt to find the root path
					// vscode.postMessage({ command: 'prompt', placeHolder: "/home/your/save/path", prompt: "Please enter your saving path" });
					vscode.postMessage({ command: 'warning', text: "Please select a path for your project and give it a name" });

					vscode.postMessage({ command: 'localSave', target: "export" });

					output();

				}
				
				  ),

				// makeButton("TEST1",////////////////////////////////////////////////////////////////////////////////////////////////////////
				// function(e, obj) { 
	
				// 	// vscode.postMessage({ command: 'alert', text: "start" });

				// 	// // vscode.postMessage({ command: 'NewFolder', text: '123', new_path: 'testtest' });
				// 	// vscode.postMessage({ command: 'prompt' });

				// 	vscode.postMessage({ command: 'alert', text: "test: " + revised_templ });

					
				// }
	
				//   ),

				// makeButton("TEST2",
				//   function(e, obj) { 		

				// 	vscode.postMessage({ command: 'localReadDir', path:"/home/ruohua/tem", target: "get_revised_templates" });

				// 	getRevisedTemplates();
			  
				//   }
	  
				// 	), 

			  $(go.Shape, "LineH", { strokeWidth: 3, height: 1, stretch: go.GraphObject.Horizontal }),
			  makeButton("New TLM ↑ Port",
				function(e, obj) { 
					// addPort("top");
					var part = obj.part.adornedPart;
					var nd = part.data;

				  	//traverse the topArray of the node to give a target
				  	var i = 0;
					while(nd.topArray[i] != null)
					{
						i++;
					}
					var count = i;

					//add a port
					addPort("top");
					var tempId = "top" + count;

					var target = "portName" + nd.key + nd.name + "top" + count;

					vscode.postMessage({ command: 'prompt', placeHolder: "Enter a port name", prompt: "port name", target: "" + target });
					setPortName(part.data,count,"top",tempId);

					refresh();
			
			}),
			  makeButton("New TLM ← Port",
				function(e, obj) { 
				// addPort("left"); 

				var part = obj.part.adornedPart;
				var nd = part.data;

				  //traverse the leftArray of the node to give a target
				  var i = 0;
				while(nd.leftArray[i] != null)
				{
					i++;
				}
				var count = i;

				//add a port
				addPort("left");
				var tempId = "left" + count;

				var target = "portName" + nd.key + nd.name + "left" + count;

				vscode.postMessage({ command: 'prompt', placeHolder: "Enter a port name", prompt: "port name", target: "" + target });
				setPortName(part.data,count,"left",tempId);
				refresh();
			
			}),
			  makeButton("New TLM → Port",
				function(e, obj) { 
				// addPort("right");
				var part = obj.part.adornedPart;
				var nd = part.data;

				//traverse the rightArray of the node to give a target
				var i = 0;
				while(nd.rightArray[i] != null)
				{
					i++;
				}
				var count = i;
				var tempId = "right" + count;

				//add a port
				addPort("right");

				var target = "portName" + nd.key + nd.name + "right" + count;

				vscode.postMessage({ command: 'prompt', placeHolder: "Enter a port name", prompt: "port name", target: "" + target });
				setPortName(part.data,count,"right",tempId);
				
				refresh();
			}),
			  makeButton("New TLM ↓ Port",
				function(e, obj) {
				// addPort("bottom");
				var part = obj.part.adornedPart;
				var nd = part.data;

				//traverse the bottomArray of the node to give a target
				var i = 0;
				while(nd.bottomArray[i] != null)
				{
					i++;
				}
				var count = i;
				var tempId = "bottom" + count;

				//add a port
				addPort("bottom");

				var target = "portName" + nd.key + nd.name + "bottom" + count;

				vscode.postMessage({ command: 'prompt', placeHolder: "Enter a port name", prompt: "port name", target: "" + target });
				setPortName(part.data,count,"bottom",tempId);

				refresh();
			}),
			  $(go.Shape, "LineH", { strokeWidth: 2, height: 1, stretch: go.GraphObject.Horizontal }),
			  makeButton("New If Port",			//adornment changes
				function(e, obj) { addPort("ad"); }),
			  makeButton("New Tr Port",			//adornment changes
				function(e, obj) { addPort("tr"); }),
			);
	
	
		  var portSize = new go.Size(8, 8);
		  var adPortSize = new go.Size(10,10);    //adornment changes
		  var portMenu =  // context menu for each port
			$("ContextMenu",
			  makeButton("Swap order",
				function(e, obj) { swapOrder(obj.part.adornedObject); }),
			  makeButton("Remove port",
				// in the click event handler, the obj.part is the Adornment;
				// its adornedObject is the port
				function(e, obj) { removePort(obj.part.adornedObject); }),
			  // makeButton("Change color",
			  //   function(e, obj) { 
			  //     changeColor(obj.part.adornedObject);}),
			  makeButton("Remove side ports",
				function(e, obj) { removeAll(obj.part.adornedObject); }),
			  makeButton("Info",
				function(e, obj) { webview_alert(portType(obj.part.adornedObject)); }),
	
			);
	
	
		  var linkMenu =  // context menu for each link
			$("ContextMenu",
			  makeButton("Delete",
				function(e, obj) { 
					var contextmenu = obj.part;  // the Button is in the context menu Adornment
					var part = contextmenu.adornedPart;  // the adornedPart is the Part that the context menu adorns
					linkDelete(part.data);

					e.diagram.commandHandler.deleteSelection(); }),    
			  makeButton("Properties",
				function(e, obj) {  // OBJ is this Button
				  var contextmenu = obj.part;  // the Button is in the context menu Adornment
				  var part = contextmenu.adornedPart;  // the adornedPart is the Part that the context menu adorns
				  webview_alert(linkInfo(part.data));
				}),
			  $(go.Shape, "LineH", { strokeWidth: 3, height: 1, stretch: go.GraphObject.Horizontal }),
			  makeButton("TLM: A -> A",
			  	function(e, obj) {  // OBJ is this Button
				  var contextmenu = obj.part;  // the Button is in the context menu Adornment
				  var part = contextmenu.adornedPart;  // the adornedPart is the Part that the context menu adorns
				  setType(part.data,"point to");
				  webview_alert("Type set to point to");
				}),
			  makeButton("TLM: A -> F -> B",
			  function(e, obj) {  // OBJ is this Button
				  var contextmenu = obj.part;  // the Button is in the context menu Adornment
				  var part = contextmenu.adornedPart;  // the adornedPart is the Part that the context menu adorns
				  setType(part.data,"fifo");
				  webview_alert("Type set to fifo");
				  }),
			  makeButton("TLM: A -> B",
			  function(e, obj) {  // OBJ is this Button
				  var contextmenu = obj.part;  // the Button is in the context menu Adornment
				  var part = contextmenu.adornedPart;  // the adornedPart is the Part that the context menu adorns
				  setType(part.data,"send receive");
				  webview_alert("Type set to send receive");

				  }),
			  $(go.Shape, "LineH", { strokeWidth: 3, height: 1, stretch: go.GraphObject.Horizontal }),
				  
			  makeButton("Config If",      //adornment changes
			  function(e, obj) {  // OBJ is this Button
				var contextmenu = obj.part;  // the Button is in the context menu Adornment
				var part = contextmenu.adornedPart;  // the adornedPart is the Part that the context menu adorns
				setAdorn(part.data,"instantiate");
				  }),
				  
			  makeButton("Config Tr",      //adornment changes
			   function(e, obj) {  // OBJ is this Button
				var contextmenu = obj.part;  // the Button is in the context menu Adornment
				var part = contextmenu.adornedPart;  // the adornedPart is the Part that the context menu adorns
				setAdorn(part.data,"transaction");
				e.diagram.commandHandler.deleteSelection();
				  }),
			  $(go.Shape, "LineH", { strokeWidth: 3, height: 1, stretch: go.GraphObject.Horizontal }),

			 makeButton("Define TLM Tr",      //adornment changes
			  function(e, obj) {  // OBJ is this Button
				var contextmenu = obj.part;  // the Button is in the context menu Adornment
				var part = contextmenu.adornedPart;  // the adornedPart is the Part that the context menu adorns
				var target = "trans" + part.data.from + part.data.fromPort + part.data.to + part.data.toPort;

				vscode.postMessage({ command: 'prompt', placeHolder: "Enter a transaction name", prompt: "trans name", target: "" + target });
				setTransaction(part.data);
				}),


			);
	
	
		  var groupMenu =  // context menu for each group
			$("ContextMenu",
			  makeButton("Copy",
				function(e, obj) { e.diagram.commandHandler.copySelection(); }),
			  makeButton("Cut",
				function(e, obj) { e.diagram.commandHandler.cutSelection(); }),  
			  makeButton("Properties",
				function(e, obj) {  // OBJ is this Button
				  var contextmenu = obj.part;  // the Button is in the context menu Adornment
				  var part = contextmenu.adornedPart;  // the adornedPart is the Part that the context menu adorns
				  alert(nodeInfo(part.data));
				}),   
			  makeButton("Delete",
			    function(e, obj) { e.diagram.commandHandler.deleteSelection(); }),
			 $(go.Shape, "LineH", { strokeWidth: 3, height: 1, stretch: go.GraphObject.Horizontal }),

			
			makeButton("uvm_driver",
			function(e, obj) { 
				var part = obj.part.adornedPart;
				iniNode(part.data,"Driver"); }),

			makeButton("uvm_monitor",
			function(e, obj) { 
				var part = obj.part.adornedPart;
				iniNode(part.data,"Monitor"); }),
			makeButton("uvm_sequencer",
			function(e, obj) { 
				var part = obj.part.adornedPart;
				iniNode(part.data,"Sequencer"); }),
			makeButton("uvm_reference_model",
			function(e, obj) { 
				var part = obj.part.adornedPart;
				iniNode(part.data,"Reference Model"); }),
			makeButton("uvm_scoreboard",
			function(e, obj) { 
				var part = obj.part.adornedPart;
				iniNode(part.data,"Scoreboard"); }),
			makeButton("uvm_component",
			function(e, obj) { 
				var part = obj.part.adornedPart;
				iniNode(part.data,"Generic Component"); }),

			$(go.Shape, "LineH", { strokeWidth: 3, height: 1, stretch: go.GraphObject.Horizontal }),


			makeButton("uvm_agent",
			function(e, obj) { 
				var part = obj.part.adornedPart;
				iniGroup(part.data,"agent"); }),   
			makeButton("uvm_env",
			function(e, obj) { 
				var part = obj.part.adornedPart;
				iniGroup(part.data,"Env"); }),   
			makeButton("uvm_component_agent",
			function(e, obj) { 
				var part = obj.part.adornedPart;
				iniGroup(part.data,"Generic Agent"); }),   			

			$(go.Shape, "LineH", { strokeWidth: 3, height: 1, stretch: go.GraphObject.Horizontal }),

			makeButton("New TLM Port",
				function(e, obj) { 
					// addPort("top");
					var part = obj.part.adornedPart;
					var nd = part.data;

				  	//traverse the topArray of the node to give a target
				  	var i = 0;
					while(nd.topArray[i] != null)
					{
						i++;
					}
					var count = i;

					//add a port
					addPort("top");
					var tempId = "top" + count;

					var target = "portName" + nd.key + nd.name + "top" + count;

					vscode.postMessage({ command: 'prompt', placeHolder: "Enter a port name", prompt: "port name", target: "" + target });
					setPortName(part.data,count,"top",tempId);

					refresh();				
				
			
				}),
			);
	
	
			myDiagram.contextMenu =
			$("ContextMenu",
			makeButton("Paste",
			  function(e, obj) { e.diagram.commandHandler.pasteSelection(e.diagram.lastInput.documentPoint); },
			  function(o) { return o.diagram.commandHandler.canPasteSelection(); }),
			makeButton("Undo",
			  function(e, obj) { e.diagram.commandHandler.undo(); },
			  function(o) { return o.diagram.commandHandler.canUndo(); }),
			makeButton("Redo",
			  function(e, obj) { e.diagram.commandHandler.redo(); },
			  function(o) { return o.diagram.commandHandler.canRedo(); }),
			$(go.Shape, "LineH", { strokeWidth: 2, height: 1, stretch: go.GraphObject.Horizontal }),
			makeButton("Refresh",
			  function(e, obj) { 
				//move everything then move them back to update UI's ports' colors
				//traverse nodeDataArray
				var i = 0;
				while(myDiagram.model.nodeDataArray[i] != null)
				{
					var a = 200;
					var b = 200;
					var c = myDiagram.model.nodeDataArray[i].loc;

					myDiagram.model.setDataProperty(myDiagram.model.nodeDataArray[i], 'loc', a,b);
					myDiagram.model.setDataProperty(myDiagram.model.nodeDataArray[i], 'loc', c);	

					i++;
				}


				//check the length of every name and resize nodes accordingly
				var i = 0;
				while(myDiagram.model.nodeDataArray[i] != null)
				{
					var nd = myDiagram.model.nodeDataArray[i];
					var name = nd.name;
					var n_len = name.length;
					if(n_len*8.3 > nd.width)
					{
						r_len_w = 8.3*n_len;
						myDiagram.model.setDataProperty(myDiagram.model.nodeDataArray[i], 'width', r_len_w);
						// myDiagram.model.setDataProperty(myDiagram.model.nodeDataArray[i], 'height', r_len_h);
					}
					i++;
				}
			}),   
			$(go.Shape, "LineH", { strokeWidth: 2, height: 1, stretch: go.GraphObject.Horizontal }),

			makeButton("New Node",
			  function(e, obj) { iniNode(); }),
			makeButton("New Group",
			  function(e, obj) { 
				iniGroup();
			  }),       
			makeButton("New Interface",
			  function(e, obj) { 
				iniInterface();
  
			  }),     
			makeButton("New Transaction",
			  function(e, obj) { 
				iniTransaction();
  
			  }),    

  
		  );
	
	//-----------------------------------------------------------------------------------------------------------------------------------------------  
	//-----------------------------------------------------------------------------------------------------------------------------------------------
	
		  //Tamplates
		  // the node template
		  // includes a panel on each side with an itemArray of panels containing ports
		  myDiagram.nodeTemplate =
			$(go.Node, "Table",
			//   { resizable: true },
			  {
				locationObjectName: "BODY",
				locationSpot: go.Spot.Center,
				selectionObjectName: "BODY",
				contextMenu: nodeMenu
			  },
			  new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
			  // the body
			  $(go.Panel, "Auto",
	  
				{
				  row: 1, column: 1, name: "BODY",
				  stretch: go.GraphObject.Fill
				},
				$(go.Shape, "Rectangle",
				  {
					fill: "#AC193D", stroke: null, strokeWidth: 0,
					// minSize: new go.Size(56, 56)
					width: 50, height: 50, 
				  },
				  new go.Binding("width", "width"),
				  new go.Binding("height", "height"),
				  new go.Binding("fill", "color"),
				  new go.Binding("type", "type")
				  ),
				$(go.TextBlock,
				  { margin: 10, textAlign: "center", font: "14px  Segoe UI,sans-serif", stroke: "white", editable: true },
				  new go.Binding("text", "name").makeTwoWay())
			  ),  // end Auto Panel body
			  // the Panel holding the left port elements, which are themselves Panels,
			  // created for each item in the itemArray, bound to data.leftArray
			  $(go.Panel, "Vertical",
				new go.Binding("itemArray", "leftArray"),
				{
				  row: 1, column: 0,
	
				  itemTemplate:
					$(go.Panel,
					  {
						_side: "left",  // internal property to make it easier to tell which side it's on
						fromSpot: go.Spot.Left, toSpot: go.Spot.Left,
						fromLinkable: true, toLinkable: true, cursor: "pointer",
						contextMenu: portMenu
					  },
					  new go.Binding("portId", "portId"),
					  new go.Binding("portTrans", "portTrans"),
					  $(go.Shape, "Rectangle",
						{
						  stroke: null, strokeWidth: 0,
						  desiredSize: portSize,
						  margin: new go.Margin(1, 0)
						},
						new go.Binding("fill", "portColor"))
					)  // end itemTemplate
				}
			  ),  // end Vertical Panel
			  // the Panel holding the top port elements, which are themselves Panels,
			  // created for each item in the itemArray, bound to data.topArray
			  $(go.Panel, "Horizontal",
				new go.Binding("itemArray", "topArray"),
				{
				  row: 0, column: 1,
	
				  itemTemplate:
					$(go.Panel,
					  {
						_side: "top",
						fromSpot: go.Spot.Top, toSpot: go.Spot.Top,
						fromLinkable: true, toLinkable: true, cursor: "pointer",
						contextMenu: portMenu
					  },
					  new go.Binding("portId", "portId"),
					  new go.Binding("portTrans", "portTrans"),

					  $(go.Shape, "Rectangle",
						{
						  stroke: null, strokeWidth: 0,
						  desiredSize: portSize,
						  margin: new go.Margin(0, 1)
						},
						new go.Binding("fill", "portColor"))
					)  // end itemTemplate
				}
			  ),  // end Horizontal Panel
			  // the Panel holding the right port elements, which are themselves Panels,
			  // created for each item in the itemArray, bound to data.rightArray
			  $(go.Panel, "Vertical",
				new go.Binding("itemArray", "rightArray"),
				{
				  row: 1, column: 2,
	
				  itemTemplate:
					$(go.Panel,
					  {
						_side: "right",
						fromSpot: go.Spot.Right, toSpot: go.Spot.Right,
						fromLinkable: true, toLinkable: true, cursor: "pointer",
						contextMenu: portMenu
					  },
					  new go.Binding("portId", "portId"),
					  new go.Binding("portTrans", "portTrans"),

					  $(go.Shape, "Rectangle",
						{
						  stroke: null, strokeWidth: 0,
						  desiredSize: portSize,
						  margin: new go.Margin(1, 0)
						},
						new go.Binding("fill", "portColor"))
					)  // end itemTemplate
				}
			  ),  // end Vertical Panel
			  // the Panel holding the bottom port elements, which are themselves Panels,
			  // created for each item in the itemArray, bound to data.bottomArray
			  $(go.Panel, "Horizontal",
				new go.Binding("itemArray", "bottomArray"),
				{
				  row: 2, column: 1,
	
				  itemTemplate:
					$(go.Panel,
					  {
						_side: "bottom",
						fromSpot: go.Spot.Bottom, toSpot: go.Spot.Bottom,
						fromLinkable: true, toLinkable: true, cursor: "pointer",
						contextMenu: portMenu
					  },
					  new go.Binding("portId", "portId"),
					  new go.Binding("portTrans", "portTrans"),

					  $(go.Shape, "Rectangle",
						{
						  stroke: null, strokeWidth: 0,
						  desiredSize: portSize,
						  margin: new go.Margin(0, 1)
						},
						new go.Binding("fill", "portColor"))
					)  // end itemTemplate
				}
			  ),  // end Horizontal Panel



			  $(go.Panel, "Horizontal",     //adornment changes
			  new go.Binding("itemArray", "adArray"),
			  {
				row: 0, column: 0,
  
				itemTemplate:
				  $(go.Panel,
					{
					  _side: "top",
					  fromSpot: go.Spot.Right, toSpot: go.Spot.Right,
					  fromLinkable: false, toLinkable: true, 
					  cursor: "pointer",
					  contextMenu: portMenu
  
					},
					new go.Binding("portId", "portId"),
					$(go.Shape, "Circle",
					  {
						stroke: null, strokeWidth: 0,
						desiredSize: adPortSize,
						margin: new go.Margin(0, 1)
					  },
					  new go.Binding("fill", "portColor"))
				  )  // end itemTemplate
			  }
			),


			$(go.Panel, "Horizontal",     //tras changes
            new go.Binding("itemArray", "trArray"),
            {
              row: 0, column: 2,

              itemTemplate:
                $(go.Panel,
                  {
                    _side: "top",
                    fromSpot: go.Spot.Bottom, toSpot: go.Spot.Bottom,
                    fromLinkable: false, toLinkable: true, cursor: "pointer",
                    contextMenu: portMenu

                  },
                  new go.Binding("portId", "portId"),
                  $(go.Shape, "Triangle",
                    {
                      stroke: null, strokeWidth: 0,
                      desiredSize: adPortSize,
                      margin: new go.Margin(0, 1)
                    },
                    new go.Binding("fill", "portColor"))
                )  // end itemTemplate
            }
          ) 
  
			);  // end Node
	
	
		  // an orthogonal link template, reshapable and relinkable
		  myDiagram.linkTemplate =
			$(CustomLink,  // defined below
			  {
	
				contextMenu: linkMenu,
	
				routing: go.Link.AvoidsNodes,
				corner: 4,
				curve: go.Link.JumpGap,
				reshapable: true,
				resegmentable: true,
				relinkableFrom: true,
				relinkableTo: true
			  },
			  new go.Binding("name", "name"),
			  new go.Binding("points").makeTwoWay(),
			  $(go.Shape, { stroke: "#42f4e5", strokeWidth: 2, strokeDashArray: [0,0] },    
			  new go.Binding("stroke", "color"),
			  new go.Binding("strokeDashArray", "dash_len"),
			  new go.Binding("trans", "trans"),

			  ),
	
			  $(go.Shape,
			  { toArrow: "Standard", stroke: "#42f4d4" })
	
			);
	
	
		  // Groups consist of a title in the color given by the group node data
		  // above a translucent gray rectangle surrounding the member parts
		  myDiagram.groupTemplate =
			$(go.Group, "Vertical",
			  {
				contextMenu: groupMenu,
				selectionObjectName: "PANEL",  // selection handle goes around shape, not label
				// ungroupable: true
			  },  // enable Ctrl-Shift-G to ungroup a selected Group
			  $(go.TextBlock,
				{
				  font: "bold 19px sans-serif",
				  isMultiline: false,  // don't allow newlines in texts
				  editable: true  // allow in-place editing by user
				},
				new go.Binding("text", "name").makeTwoWay(),
				new go.Binding("stroke", "color")),
			  $(go.Panel, "Auto",
				{ name: "PANEL" },
				$(go.Shape, "Rectangle",  // the rectangular shape around the members
				  { fill: "rgba(128,128,128,0.2)", stroke: "gray", strokeWidth: 3 }),
				$(go.Placeholder, { padding: 10 })  // represents where the members are
			  ),
			  $(go.Panel, "Vertical",
				new go.Binding("itemArray", "leftArray"),
				{
				  row: 1, column: 0,
	
				  itemTemplate:
					$(go.Panel,
					  {
						_side: "left",  // internal property to make it easier to tell which side it's on
						fromSpot: go.Spot.Left, toSpot: go.Spot.Left,
						fromLinkable: true, toLinkable: true, cursor: "pointer",
						contextMenu: portMenu
					  },
					  new go.Binding("portId", "portId"),
					  $(go.Shape, "Rectangle",
						{
						  stroke: null, strokeWidth: 0,
						  desiredSize: portSize,
						  margin: new go.Margin(1, 0)
						},
						new go.Binding("fill", "portColor"))
					)  // end itemTemplate
				}
			  ),  // end Vertical Panel
			  // the Panel holding the top port elements, which are themselves Panels,
			  // created for each item in the itemArray, bound to data.topArray
			  $(go.Panel, "Horizontal",
				new go.Binding("itemArray", "topArray"),
				{
				  row: 0, column: 1,
	
				  itemTemplate:
					$(go.Panel,
					  {
						_side: "top",
						fromSpot: go.Spot.Top, toSpot: go.Spot.Top,
						fromLinkable: true, toLinkable: true, cursor: "pointer",
						contextMenu: portMenu
					  },
					  new go.Binding("portId", "portId"),
					  $(go.Shape, "Rectangle",
						{
						  stroke: null, strokeWidth: 0,
						  desiredSize: portSize,
						  margin: new go.Margin(0, 1)
						},
						new go.Binding("fill", "portColor"))
					)  // end itemTemplate
				}
			  ),  // end Horizontal Panel
			  // the Panel holding the right port elements, which are themselves Panels,
			  // created for each item in the itemArray, bound to data.rightArray
			  $(go.Panel, "Vertical",
				new go.Binding("itemArray", "rightArray"),
				{
				  row: 1, column: 2,
	
				  itemTemplate:
					$(go.Panel,
					  {
						_side: "right",
						fromSpot: go.Spot.Right, toSpot: go.Spot.Right,
						fromLinkable: true, toLinkable: true, cursor: "pointer",
						contextMenu: portMenu
					  },
					  new go.Binding("portId", "portId"),
					  $(go.Shape, "Rectangle",
						{
						  stroke: null, strokeWidth: 0,
						  desiredSize: portSize,
						  margin: new go.Margin(1, 0)
						},
						new go.Binding("fill", "portColor"))
					)  // end itemTemplate
				}
			  ),  // end Vertical Panel
			  // the Panel holding the bottom port elements, which are themselves Panels,
			  // created for each item in the itemArray, bound to data.bottomArray
			  $(go.Panel, "Horizontal",
				new go.Binding("itemArray", "bottomArray"),
				{
				  row: 2, column: 1,
	
				  itemTemplate:
					$(go.Panel,
					  {
						_side: "bottom",
						fromSpot: go.Spot.Bottom, toSpot: go.Spot.Bottom,
						fromLinkable: true, toLinkable: true, cursor: "pointer",
						contextMenu: portMenu
					  },
					  new go.Binding("portId", "portId"),
					  $(go.Shape, "Rectangle",
						{
						  stroke: null, strokeWidth: 0,
						  desiredSize: portSize,
						  margin: new go.Margin(0, 1)
						},
						new go.Binding("fill", "portColor"))
					)  // end itemTemplate
				}
			  )  // end Horizontal Panel
			);
	
		  // // support double-clicking in the background to add a copy of this data as a node
		  // myDiagram.toolManager.clickCreatingTool.archetypeNodeData = {
		  //   name: "Unit",
		  //   leftArray: [],
		  //   rightArray: [],
		  //   topArray: [],
		  //   bottomArray: []
		  // };
	
		  // load the diagram from JSON data
		  //load();
		}
	
		//---------------------------------------------------------------------------------------------------------------------------------
		//---------------------------------------------------------------------------------------------------------------------------------
	
		// This custom-routing Link class tries to separate parallel links from each other.
		// This assumes that ports are lined up in a row/column on a side of the node.
		function CustomLink() {
		  go.Link.call(this);
		};
		go.Diagram.inherit(CustomLink, go.Link);
		CustomLink.prototype.findSidePortIndexAndCount = function(node, port) {
		  var nodedata = node.data;
		  if (nodedata !== null) {
			var portdata = port.data;
			var side = port._side;
			var arr = nodedata[side + "Array"];
			var len = arr.length;
			for (var i = 0; i < len; i++) {
			  if (arr[i] === portdata) return [i, len];
			}
		  }
		  return [-1, len];
		};
		CustomLink.prototype.computeEndSegmentLength = function(node, port, spot, from) {
		  var esl = go.Link.prototype.computeEndSegmentLength.call(this, node, port, spot, from);
		  var other = this.getOtherPort(port);
		  if (port !== null && other !== null) {
			var thispt = port.getDocumentPoint(this.computeSpot(from));
			var otherpt = other.getDocumentPoint(this.computeSpot(!from));
			if (Math.abs(thispt.x - otherpt.x) > 20 || Math.abs(thispt.y - otherpt.y) > 20) {
			  var info = this.findSidePortIndexAndCount(node, port);
			  var idx = info[0];
			  var count = info[1];
			  if (port._side == "top" || port._side == "bottom") {
				if (otherpt.x < thispt.x) {
				  return esl + 4 + idx * 8;
				} else {
				  return esl + (count - idx - 1) * 8;
				}
			  } else {  // left or right
				if (otherpt.y < thispt.y) {
				  return esl + 4 + idx * 8;
				} else {
				  return esl + (count - idx - 1) * 8;
				}
			  }
			}
		  }
		  return esl;
		};
		CustomLink.prototype.hasCurviness = function() {
		  if (isNaN(this.curviness)) return true;
		  return go.Link.prototype.hasCurviness.call(this);
		};
		CustomLink.prototype.computeCurviness = function() {
		  if (isNaN(this.curviness)) {
			var fromnode = this.fromNode;
			var fromport = this.fromPort;
			var fromspot = this.computeSpot(true);
			var frompt = fromport.getDocumentPoint(fromspot);
			var tonode = this.toNode;
			var toport = this.toPort;
			var tospot = this.computeSpot(false);
			var topt = toport.getDocumentPoint(tospot);
			if (Math.abs(frompt.x - topt.x) > 20 || Math.abs(frompt.y - topt.y) > 20) {
			  if ((fromspot.equals(go.Spot.Left) || fromspot.equals(go.Spot.Right)) &&
				(tospot.equals(go.Spot.Left) || tospot.equals(go.Spot.Right))) {
				var fromseglen = this.computeEndSegmentLength(fromnode, fromport, fromspot, true);
				var toseglen = this.computeEndSegmentLength(tonode, toport, tospot, false);
				var c = (fromseglen - toseglen) / 2;
				if (frompt.x + fromseglen >= topt.x - toseglen) {
				  if (frompt.y < topt.y) return c;
				  if (frompt.y > topt.y) return -c;
				}
			  } else if ((fromspot.equals(go.Spot.Top) || fromspot.equals(go.Spot.Bottom)) &&
				(tospot.equals(go.Spot.Top) || tospot.equals(go.Spot.Bottom))) {
				var fromseglen = this.computeEndSegmentLength(fromnode, fromport, fromspot, true);
				var toseglen = this.computeEndSegmentLength(tonode, toport, tospot, false);
				var c = (fromseglen - toseglen) / 2;
				if (frompt.x + fromseglen >= topt.x - toseglen) {
				  if (frompt.y < topt.y) return c;
				  if (frompt.y > topt.y) return -c;
				}
			  }
			}
		  }
		  return go.Link.prototype.computeCurviness.call(this);
		};
		// end CustomLink class
	
		//--------------------------------------------------------------------------------------------------------------------------------
		//--------------------------------------------------------------------------------------------------------------------------------
	
		// Add a port to the specified side of the selected nodes.
		function addPort(side) {
		  myDiagram.startTransaction("addPort");
		  myDiagram.selection.each(function(node) {
			// skip any selected Links
			if (!(node instanceof go.Node)) return;
			// compute the next available index number for the side
			var i = 0;
			while (node.findPort(side + i.toString()) !== node) i++;
			// now this new port name is unique within the whole Node because of the side prefix
			if(side == "ad")
			{
				var name = "instantiate_ad" + i.toString();
			}
			if(side == "tr")
			{
				var name = "instantiate_tr" + i.toString();
			}
			else
			{
				var name = side + i.toString();
			}
			// get the Array of port data to be modified
			var arr = node.data[side + "Array"];
			if (arr) {
			  // create a new port data object
			  var newportdata = {
				portId: name,
				// portColor: go.Brush.randomColor(),
				portColor: "grey",
				portTrans: "uNdefined",
				portIf: "uNdefined",
				portType: "uNdefined",
				// if you add port data properties here, you should copy them in copyPortData above
			  };
			  // and add it to the Array of port data
			  myDiagram.model.insertArrayItem(arr, -1, newportdata);
			}
		  });
		  myDiagram.commitTransaction("addPort");
		}
		// Exchange the position/order of the given port with the next one.
		// If it's the last one, swap with the previous one.
		function swapOrder(port) {
		  var arr = port.panel.itemArray;
		  if (arr.length >= 2) {  // only if there are at least two ports!
			for (var i = 0; i < arr.length; i++) {
			  if (arr[i].portId === port.portId) {
				myDiagram.startTransaction("swap ports");
				if (i >= arr.length - 1) i--;  // now can swap I and I+1, even if it's the last port
				var newarr = arr.slice(0);  // copy Array
				newarr[i] = arr[i + 1];  // swap items
				newarr[i + 1] = arr[i];
				// remember the new Array in the model
				myDiagram.model.setDataProperty(port.part.data, port._side + "Array", newarr);
				myDiagram.commitTransaction("swap ports");
				break;
			  }
			}
		  }
		}
		// Remove the clicked port from the node.
		// Links to the port will be redrawn to the node's shape.
		function removePort(port) {
		  myDiagram.startTransaction("removePort");
	
		  var pid = port.portId;
		  var arr = port.panel.itemArray;
		  for (var i = 0; i < arr.length; i++) {
			if (arr[i].portId === pid) {
			  myDiagram.model.removeArrayItem(arr, i);
			  break;
			}
		  }
		  myDiagram.commitTransaction("removePort");
		}
	
	
	
		// Remove all ports from the same side of the node as the clicked port.
		function removeAll(port) {
		  myDiagram.startTransaction("removePorts");
		  var nodedata = port.part.data;
		  var side = port._side;  // there are four property names, all ending in "Array"
		  myDiagram.model.setDataProperty(nodedata, side + "Array", []);  // an empty Array
		  myDiagram.commitTransaction("removePorts");
		}
		// Change the color of the clicked port.
		function changeColor(port) {
		  myDiagram.startTransaction("colorPort");
		  var data = port.data;
		  myDiagram.model.setDataProperty(data, "portColor", go.Brush.randomColor());
		  myDiagram.commitTransaction("colorPort");
		}
	
	
		function saveExe()
		{
			window.addEventListener('message', event => {
				var message = event.data;
				var url = message.path;
				var target = message.target;

				if(target == "save")
				{
					// document.getElementById("mySavedModel").value = myDiagram.model.toJson();
					var div = myDiagram.model.toJson();
					myDiagram.isModified = false;

					//add a piece of info into the Json file to locate the path to file templates


					vscode.postMessage({ command: 'alert', text: "Diagram saved to " + url });

					vscode.postMessage({ command: 'NewFile', text: "" + div, new_path: url });
				}

			})

		}
		// Save the model to / load it from JSON text in a database.
		function save() {
		  vscode.postMessage({ command: 'localSave', target: "save" });
		  saveExe();
		}

		function loadExe()
		{
			window.addEventListener('message', event => {
				var message = event.data;
				var text = message.text;
				var target = message.target;
	
				if(target == "read")
				{	
					vscode.postMessage({ command: 'alert', text: "opened diagram: " + text });

					myDiagram.model = go.Model.fromJson(text);
				}
			})

		}
		function load() {
			vscode.postMessage({ command: 'localRead', target:"read" });
			loadExe();

		//   myDiagram.model = go.Model.fromJson(document.getElementById("mySavedModel").value);
		  // When copying a node, we need to copy the data that the node is bound to.
		  // This JavaScript object includes properties for the node as a whole, and
		  // four properties that are Arrays holding data for each port.
		  // Those arrays and port data objects need to be copied too.
		  // Thus Model.copiesArrays and Model.copiesArrayObjects both need to be true.
		  // Link data includes the names of the to- and from- ports;
		  // so the GraphLinksModel needs to set these property names:
		  // linkFromPortIdProperty and linkToPortIdProperty.
	
	
		}


		function outputExe()
		{	
			//set the root saving path
			window.addEventListener('message', event => {
			var message = event.data;
			// var text = message.text;
			var text = message.path;
			var target = message.target;
			//set wanted path for the machine
			root_path = text;

			if(target == "export")
			{
				vscode.postMessage({ command: 'NewFolder', new_path: "" + root_path });
				// vscode.postMessage({ command: 'alert', text: "set path to: " + root_path });

				root_path2 = root_path + "/rtl";
				vscode.postMessage({ command: 'NewFolder', new_path: "" + root_path2 });

				root_path1 = root_path + "/tb";
				vscode.postMessage({ command: 'NewFolder', new_path: "" + root_path1 });

				cur_path1 = root_path1 + "/testbench";
				vscode.postMessage({ command: 'NewFolder', new_path: "" + cur_path1 });
				cur_path2 = root_path1 + "/testcase";
				vscode.postMessage({ command: 'NewFolder', new_path: "" + cur_path2 });
				cur_path3 = root_path1 + "/testlist";
				vscode.postMessage({ command: 'NewFolder', new_path: "" + cur_path3 });

				// vscode.postMessage({ command: 'alert', text: "set path to: " + root_path });


				vscode.postMessage({ command: 'NewFile', new_path: "" + root_path2 + "/DUT.v", text: dut_templ });


				//reset all counters
				driver_num = 0;
				monitor_num = 0;
				agent_num = 0;
				sequencer_num = 0;
				scoreboard_num = 0;
				model_num = 0;
				undefined_num = 0;
				env_num = 0;
				
				point_to_arr = [];

				//convert all GoJS graphical items to self-defined objects
				all2objects();

				//realization starts from env
				var i = 0;
				while(nodesArray[i]!=null)
				{
					if(nodesArray[i].type == "Env" && nodesArray[i].group == "Original")
					{
						nodesArray[i].real(cur_path1);
					}
					i++;

				}
			}


		});
	
	  
	  
		}

		function outputRefer()
		{
			vscode.postMessage({ command: 'warning', text: "Please select a path for your project and give it a name" });

			vscode.postMessage({ command: 'localSave', target: "export" });

			outputExe();

		}

		//get the prepared templates path for the UI
		//and refer to template distribution function to assign each template var
		function templates()
		{
			vscode.postMessage({ command: 'prompt', placeHolder: "/home/your/save/path", prompt: "Please enter your saving path", target: "get_templates" });
			templatesExe();
		}
		function templatesExe()	
		{
			window.addEventListener('message', event => {
				var message = event.data;
				var text = message.text;
				var target = message.target;
				
				//get the template path
				if(target == "get_templates")
				{	
					//update the global templates URL
					templates_url = message.text;


					//get templates
					//assign templates vars one by one
					var templ_types_arr = ["Monitor", "Driver", "Reference Model", "Scoreboard", "Top", "Agent", "Sequencer", "Transaction", "Interface", "Environment"];
		

					var i = 0;
					while(templ_types_arr[i] != null)
					{
						vscode.postMessage({ command: 'localReadFile', url: "/Tools/zonghua/default_templates/" + templ_types_arr[i] + ".sv", 
						target: "templates_distr", targetComp: templ_types_arr[i] });

						templatesDistr(templ_types_arr[i]);

						i++;
					}
					vscode.postMessage({ command: 'localReadFile', url: "/Tools/zonghua/default_templates/" + "DUT.v", 
					target: "templates_distr", targetComp: "DUT" });

					// vscode.postMessage({ command: 'alert', text: "test2: " + });


					templatesDistr("DUT");


					var i = 0;
					while(revised_templ[0] != null)
					{
						revised_templ.pop();
					}
					vscode.postMessage({ command: 'localReadDir', path: templates_url, target: "get_revised_templates" });
					getRevisedTemplates();

				}
				
			});

		}

		function templatesDistr(type)
		{
			window.addEventListener('message', event => {
				var message = event.data;
				var text = message.text;
				var target = message.target;
				var targetComp = message.targetComp;

				if(target == "templates_distr" && targetComp == type)
				{
					vscode.postMessage({ command: 'alert', text: "loading tem from: " + message.path });

					if(targetComp == "Monitor")
					{
						monitor_templ = text;
						// vscode.postMessage({ command: 'alert', text: "test2: " + targetComp });

					}
					else if(targetComp == "Driver")
					{
						driver_templ = text;
					}
					else if(targetComp == "Sequencer")
					{
						sequencer_templ = text;
					}
					else if(targetComp == "Agent")
					{
						agent_templ = text;
					}
					else if(targetComp == "Scoreboard")
					{
						scoreboard_templ = text;
					}
					else if(targetComp == "Reference Model")
					{
						model_templ = text;
					}
					else if(targetComp == "Top")
					{
						top_templ = text;
					}
					else if(targetComp == "Transaction")
					{
						transaction_templ = text;
					}
					else if(targetComp == "Interface")
					{
						interface_templ = text;
					}
					else if(targetComp == "Environment")
					{
						env_templ = text;
					}
					else if(targetComp == "DUT")
					{
						dut_templ = text;
						vscode.postMessage({ command: 'alert', text: "dut is " + text });
					}

				}
	

			});
		}


		function getRevisedTemplates()
		{
			
			window.addEventListener('message', event => {
				var message = event.data;
				var name = message.name;
				var text = message.text;
				var templ_types_arr = ["Monitor", "Driver", "Reference Model", "Scoreboard", "Top", "Agent", "Sequencer", "Transaction", "Interface"];

				if(message.target == "get_revised_templates")
				{
					name = name.replace(".sv","");
				
					var flag = false;
					var i = 0;
					while(templ_types_arr[i] != null)
					{
						if(name == templ_types_arr[i])
						{
							flag = true;
						}
						i++;
					}

					if(flag == false)
					{
						var t_ele = [name,text];

						// vscode.postMessage({ command: 'NewFile', new_path: "/home/ruohua/test-save/" + name + ".sv", text: text});

						revised_templ.push(t_ele);
					}

				}
		
			});
		}



	
	
	///////////////////////////////
	//////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	function determine_port(Id,node)
	{
		//determine which kind of port from_port is
		var side;
		var index = null;
		//from, left
		//determine max index for a side array
		var i = 0;
		while(myDiagram.model.findNodeDataForKey(node).leftArray[i]!=null)
		{
			i++;
		}    
		//now i is the max index of the array
		if(i!=0)
		{
			var j;
			for(j=0;j<i;j++)
			{
				if(myDiagram.model.findNodeDataForKey(node).leftArray[j].portId==Id)
				{
					side = "left";
					index = j;
				}
			}
		}
	
		//from, right
		//determine max index for a side array
		var i = 0;
		while(myDiagram.model.findNodeDataForKey(node).rightArray[i]!=null)
		{
			i++;
		}    
		//now i is the max index of the array
		if(i!=0)
		{
			var j;
			for(j=0;j<i;j++)
			{
				if(myDiagram.model.findNodeDataForKey(node).rightArray[j].portId==Id)
				{
					side = "right";
					index = j;        
				}
			}
		}
	
		//from, top
		//determine max index for a side array
		var i = 0;
		while(myDiagram.model.findNodeDataForKey(node).topArray[i]!=null)
		{
			i++;
		}    
		//now i is the max index of the array
		if(i!=0)
		{
			var j;
			for(j=0;j<i;j++)
			{
				if(myDiagram.model.findNodeDataForKey(node).topArray[j].portId==Id)
				{
					side = "top";
					index = j;        
				}
			}
		}
		//from, bottom
		//determine max index for a side array
		var i = 0;
		while(myDiagram.model.findNodeDataForKey(node).bottomArray[i]!=null)
		{
			i++;
		}    
		//now i is the max index of the array
		if(i!=0)
		{
			var j;
			for(j=0;j<i;j++)
			{
				if(myDiagram.model.findNodeDataForKey(node).bottomArray[j].portId==Id)
				{
					side = "bottom";
					index = j;      
				}
			}
		}
		var re_arr = [];
		re_arr[0] = index;
		re_arr[1] = side;
	
		return re_arr;
	}
	
	
	function allocate_type(f_node,t_node,from_s,from_i,fromPort,to_s,to_i,toPort,type)
	{
		var temp = "";
		//check if either link is a "point to" link's fromPort
		if(from_s=="left")
		{
		  temp = f_node.leftArray[from_i].portType; 
		}
		if(from_s=="right")
		{
		  temp = f_node.rightArray[from_i].portType; 
		}
		if(from_s=="top")
		{
		  temp = f_node.topArray[from_i].portType; 
		}
		if(from_s=="bottom")
		{
		  temp = f_node.bottomArray[from_i].portType; 
		}

		var f_is_waiting = false;
		if(temp == "waitingFrom")
		{
			f_is_waiting = true;
		}

		var temp1 = "";
		if(to_s=="left")
		{
		  temp1 = t_node.leftArray[to_i].portType; 
		}
		if(to_s=="right")
		{
		  temp1 = t_node.rightArray[to_i].portType;   
		}
		if(to_s=="top")
		{
		  temp1 = t_node.topArray[to_i].portType; 
		}
		if(to_s=="bottom")
		{
		  temp1 = t_node.bottomArray[to_i].portType; 
		}

		var t_is_waiting = false;
		if(temp1 == "waitingFrom")
		{
			t_is_waiting = true;
		}




		//start allocating
		if(type=="send receive")
		{
		  if(from_s=="left")
		  {
			f_node.leftArray[from_i].portType = "analysis_port"; 
			f_node.leftArray[from_i].portColor = "blue"; 
		  }
		  if(from_s=="right")
		  {
			f_node.rightArray[from_i].portType = "analysis_port"; 
			f_node.rightArray[from_i].portColor = "blue"; 
		  }
		  if(from_s=="top")
		  {
			f_node.topArray[from_i].portType = "analysis_port"; 
			f_node.topArray[from_i].portColor = "blue"; 
		  }
		  if(from_s=="bottom")
		  {
			f_node.bottomArray[from_i].portType = "analysis_port"; 
			f_node.bottomArray[from_i].portColor = "blue"; 
		  }
		  f_type = "analysis_port";
	
	
		  if(to_s=="left")
		  {
			t_node.leftArray[to_i].portType = "IMP"; 
			t_node.leftArray[to_i].portColor = "orange"; 
		  }
		  if(to_s=="right")
		  {
			t_node.rightArray[to_i].portType = "IMP";
			t_node.rightArray[to_i].portColor = "orange"; 
	 
		  }
		  if(to_s=="top")
		  {
			t_node.topArray[to_i].portType = "IMP"; 
			t_node.topArray[to_i].portColor = "orange"; 
		  }
		  if(to_s=="bottom")
		  {
			t_node.bottomArray[to_i].portType = "IMP"; 
			t_node.bottomArray[to_i].portColor = "orange"; 
		  }
		  t_type = "IMP";
	
		}
	
	
		else if(type=="fifo")
		{
			if(from_s=="left")
			{
			  f_node.leftArray[from_i].portType = "analysis_port";
			  f_node.leftArray[from_i].portColor = "blue"; 
			}
			if(from_s=="right")
			{
			  f_node.rightArray[from_i].portType = "analysis_port"; 
			  f_node.rightArray[from_i].portColor = "blue"; 
			}
			if(from_s=="top")
			{
			  f_node.topArray[from_i].portType = "analysis_port"; 
			  f_node.topArray[from_i].portColor = "blue"; 
			}
			if(from_s=="bottom")
			{
			  f_node.bottomArray[from_i].portType = "analysis_port"; 
			  f_node.bottomArray[from_i].portColor = "blue"; 
			}
			f_type = "analysis_port"
	  
	  
			if(to_s=="left")
			{
			  t_node.leftArray[to_i].portType = "PORT"; 
			  t_node.leftArray[to_i].portColor = "brown"; 
			}
			if(to_s=="right")
			{
			  t_node.rightArray[to_i].portType = "PORT"; 
			  t_node.rightArray[to_i].portColor = "brown"; 
			}
			if(to_s=="top")
			{
			  t_node.topArray[to_i].portType = "PORT"; 
			  t_node.topArray[to_i].portColor = "brown"; 
			}
			if(to_s=="bottom")
			{
			  t_node.bottomArray[to_i].portType = "PORT"; 
			  t_node.bottomArray[to_i].portColor = "brown"; 
			}
			t_type = "PORT";
	
		  }

		  
		  //check if either link is a "point to" link's fromPort
		  if(f_is_waiting == true)
		  {
			var i = 0;
			while(myDiagram.model.linkDataArray[i] != null)
			{
				if(myDiagram.model.linkDataArray[i].from == f_node.key || myDiagram.model.linkDataArray[i].name == "point to")
				{

					if(myDiagram.model.linkDataArray[i].fromPort == fromPort)
					{
						t_nodet_key = myDiagram.model.linkDataArray[i].to;
						t_nodet= myDiagram.model.findNodeDataForKey(t_nodet_key);
						var arr = determine_port(myDiagram.model.linkDataArray[i].toPort,myDiagram.model.linkDataArray[i].to);	
						var to_it = arr[0];
						var to_st = arr[1];


						if(to_st=="left")
						{
						  t_nodet.leftArray[to_it].portType = f_type; 
						  t_nodet.leftArray[to_it].portColor = "lightblue"; 
						}
						if(to_st=="right")
						{
						  t_nodet.rightArray[to_it].portType = f_type; 
						  t_nodet.rightArray[to_it].portColor = "lightblue"; 
						}
						if(to_st=="top")
						{
						  t_nodet.topArray[to_it].portType = f_type; 
						  t_nodet.topArray[to_it].portColor = "lightblue"; 
						}
						if(to_st=="bottom")
						{
						  t_nodet.bottomArray[to_it].portType = f_type; 
						  t_nodet.bottomArray[to_it].portColor = "lightblue"; 
						}

						vscode.postMessage({ command: 'alert', text: "after " });
					}


				}

				i++;

			}


		  }


		  if(t_is_waiting == true)
		  {
			var i = 0;
			while(myDiagram.model.linkDataArray[i] != null)
			{
				if(myDiagram.model.linkDataArray[i].from == t_node || myDiagram.model.linkDataArray[i].name == "point to")
				{
					if(myDiagram.model.linkDataArray[i].fromPort == toPort)
					{
						t_nodet_key = myDiagram.model.linkDataArray[i].to;
						t_nodet= myDiagram.model.findNodeDataForKey(t_nodet_key);

						var arr = determine_port(myDiagram.model.linkDataArray[i].toPort,myDiagram.model.linkDataArray[i].to);
						var to_it = arr[0];
						var to_st = arr[1];


						if(to_st=="left")
						{
						  t_nodet.leftArray[to_it].portType = t_type; 
						  t_nodet.leftArray[to_it].portColor = "lightblue"; 
						}
						if(to_st=="right")
						{
						  t_nodet.rightArray[to_it].portType = t_type; 
						  t_nodet.rightArray[to_it].portColor = "lightblue"; 
						}
						if(to_st=="top")
						{
						  t_nodet.topArray[to_it].portType = t_type; 
						  t_nodet.topArray[to_it].portColor = "lightblue"; 
						}
						if(to_st=="bottom")
						{
						  t_nodet.bottomArray[to_it].portType = t_type; 
						  t_nodet.bottomArray[to_it].portColor = "lightblue"; 
						}
					
					}


				}

				i++;

			}


		  }	

	
	
		  if(type=="point to")
		  {  
	
			//determine the portType of the agent
			//see if defined
			if(from_s=="left")
			{
			 var agt_type = f_node.leftArray[from_i].portType;
			}
			if(from_s=="right")
			{
			  var agt_type = f_node.rightArray[from_i].portType; 
			}
			if(from_s=="top")
			{
			  var agt_type = f_node.topArray[from_i].portType; 
			}
			if(from_s=="bottom")
			{
			  var agt_type = f_node.bottomArray[from_i].portType; 
			}
	
	
			if(agt_type=="analysis_port" || agt_type=="PORT" || agt_type=="IMP")
			{
				if(to_s=="left")
				{
				  t_node.leftArray[to_i].portType = agt_type; 
				  t_node.leftArray[to_i].portColor = "lightblue"; 

				}
				if(to_s=="right")
				{
				  t_node.rightArray[to_i].portType = agt_type; 
				  t_node.rightArray[to_i].portColor = "lightblue"; 
				}
				if(to_s=="top")
				{
				  t_node.topArray[to_i].portType = agt_type; 
				  t_node.topArray[to_i].portColor = "lightblue"; 
				}
				if(to_s=="bottom")
				{
				  t_node.bottomArray[to_i].portType = agt_type; 
				  t_node.bottomArray[to_i].portColor = "lightblue"; 
				}
	
			}
	
			//fromPort of the "point to" link is not yet assigned
			//indicate ports require assignment in the future
			else
			{
				if(to_s=="left")
				{
				  t_node.leftArray[to_i].portType = "waitingTo"; 
				}
				if(to_s=="right")
				{
				  t_node.rightArray[to_i].portType = "waitingTo"; 
				}
				if(to_s=="top")
				{
				  t_node.topArray[to_i].portType = "waitingTo"; 
				}
				if(to_s=="bottom")
				{
				  t_node.bottomArray[to_i].portType = "waitingTo"; 
				}


				if(from_s=="left")
				{
				  f_node.leftArray[from_i].portType = "waitingFrom";
				}
				if(from_s=="right")
				{
				  f_node.rightArray[from_i].portType = "waitingFrom"; 
				}
				if(from_s=="top")
				{
				  f_node.topArray[from_i].portType = "waitingFrom"; 
				}
				if(from_s=="bottom")
				{
				  f_node.bottomArray[from_i].portType = "waitingFrom"; 
				}


			}


	  
		  }
	
	}
	
	
	
	
	//*******************************************************************************************************
	
	
	
	
	function sequencer_real_main(sequencer,templ1,templ2,templ3,templ4) 
	{
		sequencer_arr = [];

		
		sequencer_arr.push("////template block: head_block starts" + "\\n\\n");
		sequencer_arr.push(templ1 + "\\n");
		sequencer_arr.push("////template block: head_block ends" + "\\n\\n");


		sequencer_arr.push('class ' + sequencer.comp_name + ' extends uvm_sequencer #(' + sequencer.transaction + ');' + " \\n");

		sequencer_arr.push("////template block: variable_block starts" + "\\n");
		sequencer_arr.push(templ2);
		sequencer_arr.push("////template block: variable_block ends" + "\\n\\n");


		//declare all ports
		if(sequencer.ports != null)
		{
			var i = 0;
			while(sequencer.ports[i]!=null)
			{
				if(sequencer.ports[i].portType=="analysis_port")
				{
					sequencer_arr.push("\\t" + "uvm_analysis_port #(" + sequencer.ports[i].portTrans + ")  " + sequencer.ports[i].portId + ";" + " \\n");
				}

				else if(sequencer.ports[i].portType=="PORT")
				{
					sequencer_arr.push("\\t" + "uvm_blocking_get_port #(" + sequencer.ports[i].portTrans + ")  " + sequencer.ports[i].portId + ";" + " \\n");
				}

				else if(sequencer.ports[i].portType=="IMP")
				{
					sequencer_arr.push("\\t" + "uvm_analysis_imp #(" + sequencer.ports[i].portTrans + ")  " + sequencer.ports[i].portId + ";" + " \\n");
				}

				i++;
			}

		}

		sequencer_arr.push("\\textern function new( string name, uvm_component parent);" + "\\n"
							+ "\\textern function void build_phase(uvm_phase phase);  \\n\\n");
		sequencer_arr.push("\\t//Register  \\n");


		sequencer_arr.push("////template block: func_decl_block starts" + "\\n");
		sequencer_arr.push(templ3 + "\\n");
		sequencer_arr.push("////template block: func_decl_block ends" + "\\n\\n");


		sequencer_arr.push("\\t\`uvm_component_utils(" + sequencer.comp_name + ") \\n");
		sequencer_arr.push("endclass \\n\\n");

		sequencer_arr.push("function " + sequencer.comp_name + "::new(string name, uvm_component parent); \\n");
		sequencer_arr.push("\\tsuper.new(name, parent); \\n");
		sequencer_arr.push("endfunction // new \\n\\n");
		sequencer_arr.push("function void " + sequencer.comp_name + "::build_phase(uvm_phase phase); \\n");
		sequencer_arr.push("super.build_phase(phase); \\n");
		sequencer_arr.push("endfunction \\n");


		sequencer_arr.push("////template block: func_def_block starts" + "\\n");
		sequencer_arr.push(templ4);
		sequencer_arr.push("////template block: func_def_block ends" + "\\n\\n");


		return sequencer_arr;
	}
	
	
	//*************************************************************************************************************
	
	
	function scoreboard_real_main(scoreboard,templ1,templ2,templ3,templ4,templ5,templ6,templ7)			//working on
	{
		scoreboard_arr = [];


		scoreboard_arr.push("////template block: head_block starts" + "\\n");
		scoreboard_arr.push(templ1 + "\\n");
		scoreboard_arr.push("////template block: head_block ends" + "\\n");


		scoreboard_arr.push(" \\n");
		scoreboard_arr.push('class ' + scoreboard.comp_name + ' extends uvm_scoreboard;' + " \\n");
	

		if(scoreboard.interface == null)
		{
			scoreboard_arr.push('\\tvirtual default_if m_vif;' + "//this is default if" + " \\n");
		}
		else
		{
			var i = 0;
			while(scoreboard.interface[i]!=null)
			{
				scoreboard_arr.push('\\tvirtual ' + scoreboard.interface[i] + ' m_' + scoreboard.interface[i] + "; \\n");
				i++;
			}
		}




		scoreboard_declare_ports(scoreboard);


		scoreboard_arr.push("////template block: variable_block starts" + "\\n");
		scoreboard_arr.push(templ2);
		scoreboard_arr.push("////template block: variable_block ends" + "\\n\\n");

	
		scoreboard_arr.push("\\t" + 'extern function new(string name, uvm_component parent);' + " \\n");
		scoreboard_arr.push("\\t" + 'extern function void build_phase(uvm_phase phase);' + " \\n");
		scoreboard_arr.push("\\t" + 'extern virtual task main_phase(uvm_phase phase);' + " \\n\\n");


		scoreboard_arr.push("////template block: func_decl_block starts" + "\\n");
		scoreboard_arr.push(templ3);
		scoreboard_arr.push("////template block: func_decl_block ends" + "\\n\\n");

					
		scoreboard_arr.push("\\t" + '\`uvm_component_utils(' + scoreboard.comp_name + ')' + " \\n");
	
		scoreboard_arr.push('endclass // scoreboard' + "\\n\\n");
		scoreboard_arr.push(" \\n");
	
		scoreboard_arr.push("function " + scoreboard.comp_name + "::new(string name, uvm_component parent);" + " \\n" + 
		"\\t" + "super.new(name, parent);" + " \\n");


		scoreboard_arr.push("////template block: new_object starts" + "\\n");
		scoreboard_arr.push(templ4);
		scoreboard_arr.push("////template block: new_object ends" + "\\n\\n");
		
		
		scoreboard_arr.push("endfunction // new" + " \\n\\n");
		scoreboard_arr.push(" \\n");
	
		scoreboard_build_phase(scoreboard,templ5);
	
		scoreboard_arr.push(" \\n");
	
		scoreboard_main_phase(scoreboard,templ6);


		scoreboard_arr.push("////template block: func_def_block starts" + "\\n");
		scoreboard_arr.push(templ7);
		scoreboard_arr.push("////template block: func_def_block ends" + "\\n\\n");
	
	
		return scoreboard_arr;
	
	}
	
	
	function scoreboard_declare_ports(scoreboard)
	{
		var i = 0;
		while(scoreboard.ports[i]!=null)
		{
			if(scoreboard.ports[i].portType=="analysis_port")
			{
				scoreboard_arr.push("\\t" + "uvm_analysis_port #(" + scoreboard.ports[i].portTrans +") " + scoreboard.ports[i].portId + ";" + " \\n");
			}
			else if(scoreboard.ports[i].portType=="PORT")
			{
				scoreboard_arr.push("\\t" + "uvm_blocking_get_port #(" + scoreboard.ports[i].portTrans + ") " + scoreboard.ports[i].portId + ";" + " \\n");
			}
			else if(scoreboard.ports[i].portType=="IMP")
			{
				scoreboard_arr.push("\\t" + "uvm_analysis_imp #(" + scoreboard.ports[i].portTrans + ")  " + scoreboard.ports[i].portId + ";" + " \\n");
			}

			i++;
		}
	
	}
	
	
	function scoreboard_build_phase(scoreboard,templ5)
	{
	
		scoreboard_arr.push("function void " + scoreboard.comp_name + "::build_phase(uvm_phase phase);" + " \\n" + "\\tsuper.build_phase(phase);" + " \\n");
	
		var i = 0;
		while(scoreboard.ports[i]!=null)
		{
	
			scoreboard_arr.push("\\t" + scoreboard.ports[i].portId + "=" + 'new("' + scoreboard.ports[i].portId + '", this)' +  ";" + " \\n");
	
			i++;
		}

		if(scoreboard.interface == null)
		{
			scoreboard_arr.push('\\tif(!uvm_config_db#(virtual default_if)::get(this, "", "default_if", m_vif))' + " \\n");
			scoreboard_arr.push('\\t\\t\`uvm_fatal(get_full_name(), "Error in Getting interface");' + " \\n");
		}

		else
		{
			var i = 0;

			while(scoreboard.interface[i]!=null)
			{
				scoreboard_arr.push('\\tif(!uvm_config_db#(virtual ' + scoreboard.interface[i] +  ')::get(this, "","' + scoreboard.interface[i] + '", m_' + scoreboard.interface[i] + '))' + " \\n");
				scoreboard_arr.push('\\t\\t\`uvm_fatal(get_full_name(), "Error in Getting interface");' + " \\n");
				i++;
			}
		}


		scoreboard_arr.push("////template block: build_phase starts" + "\\n");
		scoreboard_arr.push(templ5);
		scoreboard_arr.push("////template block: build_phase ends" + "\\n\\n");

	
		scoreboard_arr.push('endfunction // build_phase' + " \\n\\n");
	
	}
	
	function scoreboard_main_phase(scoreboard,templ6)
	{
	
		scoreboard_arr.push("task " + scoreboard.comp_name + "::main_phase(uvm_phase phase);" + " \\n");

				
		scoreboard_arr.push("////template block: main_phase starts" + "\\n");
		scoreboard_arr.push(templ6);
		scoreboard_arr.push("////template block: main_phase ends" + "\\n\\n");

	
		scoreboard_arr.push("endtask\\n\\n");
	
	}
	
	
	//*****************************************************************************************************************
	
	
	
	function reference_model_real_main(model,templ1,templ2,templ3,templ4,templ5,templ6,templ7)
	{
		model_arr = [];


		model_arr.push("////template block: head_block starts" + "\\n");
		model_arr.push(templ1 + "\\n");
		model_arr.push("////template block: head_block ends" + "\\n");


		model_arr.push(" \\n");
		model_arr.push('class ' + model.comp_name + ' extends uvm_component;' + " \\n");
	

		if(model.interface == null)
		{
			model_arr.push('\\tvirtual default_if m_vif;' + "//this is default if" + " \\n");
		}
		else
		{
			var i = 0;
			while(model.interface[i]!=null)
			{
				model_arr.push('\\tvirtual ' + model.interface[i] + ' m_' + model.interface[i] + "; \\n");
				i++;
			}
		}



		model_declare_ports(model);


		model_arr.push("////template block: variable_block starts" + "\\n");
		model_arr.push(templ2);
		model_arr.push("////template block: variable_block ends" + "\\n\\n");

	
		model_arr.push("\\t" + 'extern function new(string name, uvm_component parent);' + " \\n");
		model_arr.push("\\t" + 'extern function void build_phase(uvm_phase phase);' + " \\n");
		model_arr.push("\\t" + 'extern virtual task main_phase(uvm_phase phase);' + " \\n");
		model_arr.push(" \\n");


		model_arr.push("////template block: func_decl_block starts" + "\\n");
		model_arr.push(templ3 + "\\n");
		model_arr.push("////template block: func_decl_block ends" + "\\n\\n");

					
		model_arr.push("\\t" + '\`uvm_component_utils(' + model.comp_name + ')' + " \\n");
	
		model_arr.push('endclass // model' + " \\n\\n");
		model_arr.push(" \\n");
	
		model_arr.push("function " + model.comp_name + "::new(string name, uvm_component parent);" + " \\n" + 
		"\\t" + "super.new(name, parent);" + " \\n");


		model_arr.push("////template block: new_object starts" + "\\n");
		model_arr.push(templ4);
		model_arr.push("////template block: new_object ends" + "\\n\\n");
		
		
		model_arr.push("endfunction // new" + " \\n\\n");
		model_arr.push(" \\n");
	
		model_build_phase(model,templ5);
	
		model_arr.push(" \\n");
	
		model_main_phase(model,templ6);


		model_arr.push("////template block: func_def_block starts" + "\\n");
		model_arr.push(templ7);
		model_arr.push("////template block: func_def_block ends" + "\\n\\n");
	
	
		return model_arr;
	
	}
	
	
	function model_declare_ports(model)
	{
		var i = 0;
		while(model.ports[i]!=null)
		{
			if(model.ports[i].portType=="analysis_port")
			{
				model_arr.push("\\t" + "uvm_analysis_port #(" + model.ports[i].portTrans +") " + model.ports[i].portId + ";" + " \\n");
			}
			else if(model.ports[i].portType=="PORT")
			{
				model_arr.push("\\t" + "uvm_blocking_get_port #(" + model.ports[i].portTrans + ") " + model.ports[i].portId + ";" + " \\n");
			}
			else if(model.ports[i].portType=="IMP")
			{
				model_arr.push("\\t" + "uvm_analysis_imp #(" + model.ports[i].portTrans + ")  " + model.ports[i].portId + ";" + " \\n");
			}

			i++;
		}
	
	}
	
	
	function model_build_phase(model,templ5)
	{
	
		model_arr.push("function void " + model.comp_name + "::build_phase(uvm_phase phase);" + " \\n" + "\\tsuper.build_phase(phase);" + " \\n");
	
		var i = 0;
		while(model.ports[i]!=null)
		{
	
			model_arr.push("\\t" + model.ports[i].portId + "=" + 'new("' + model.ports[i].portId + '", this)' +  ";" + " \\n");
	
			i++;
		}


		if(model.interface == null)
		{
			model_arr.push('\\tif(!uvm_config_db#(virtual default_if)::get(this, "", "default_if", m_vif))' + " \\n");
			model_arr.push('\\t\\t\`uvm_fatal(get_full_name(), "Error in Getting interface");' + " \\n");
		}

		else
		{
			var i = 0;

			while(model.interface[i]!=null)
			{
				model_arr.push('\\tif(!uvm_config_db#(virtual ' + model.interface[i] +  ')::get(this, "","' + model.interface[i] + '", m_' + model.interface[i] + '))' + " \\n");
				model_arr.push('\\t\\t\`uvm_fatal(get_full_name(), "Error in Getting interface");' + " \\n");
				i++;
			}
		}


		model_arr.push("////template block: build_phase starts" + "\\n");
		model_arr.push(templ5);
		model_arr.push("////template block: build_phase ends" + "\\n");

	
		model_arr.push('endfunction // build_phase' + " \\n\\n");
	
	}
	
	function model_main_phase(model,templ6)
	{
	
		model_arr.push("task " + model.comp_name + "::main_phase(uvm_phase phase);" + " \\n");

				
		model_arr.push("////template block: main_phase starts" + "\\n");
		model_arr.push(templ6);
		model_arr.push("////template block: main_phase ends" + "\\n\\n");

	
		model_arr.push("endtask\\n\\n");
	
	}
	
	
	//**********************************************************************************************************************
	
	
	
	function monitor_real_main(monitor,templ1,templ2,templ3,templ4,templ5,templ6,templ7)		//working on
	{
		monitor_arr = [];

		monitor_arr.push("////template block: head_block starts" + "\\n");
		monitor_arr.push(templ1);
		monitor_arr.push("////template block: head_block ends" + "\\n\\n");


		monitor_arr.push('class ' + monitor.comp_name + ' extends uvm_monitor #(' + monitor.transaction + ');' + " \\n");
		if(monitor.interface == null)
		{
			monitor_arr.push('\\tvirtual default_if m_vif;' + "//this is default if" + " \\n");
		}
		else
		{
			var i = 0;
			while(monitor.interface[i]!=null)
			{
				monitor_arr.push('\\tvirtual ' + monitor.interface[i] + ' m_' + monitor.interface[i] + "; \\n");
				i++;
			}
		}
	
		monitor_declare_ports(monitor);


		monitor_arr.push("////template block: variable_block starts" + "\\n");
		monitor_arr.push(templ2 );
		monitor_arr.push("////template block: variable_block ends" + "\\n\\n");


		monitor_arr.push("\\textern function new (string name, uvm_component parent) \\n"
						+ "\\textern virtual function void build_phase(uvm_phase phase); \\n"
						+ "\\textern virtual task main_phase(uvm_phase phase);" + "\\n\\n");


		monitor_arr.push("////template block: func_decl_block starts" + "\\n");
		monitor_arr.push(templ3);
		monitor_arr.push("////template block: func_decl_block ends" + "\\n\\n");

						
		monitor_arr.push("\\t" + '\`uvm_component_utils(' + monitor.comp_name + ')' + " \\n");

		monitor_arr.push('endclass // monitor' + " \\n\\n");
		monitor_arr.push(" \\n");
	

		
		monitor_arr.push("function " + monitor.comp_name + "::new(string name, uvm_component parent);" + " \\n" + 
		"\\t" + "super.new(name, parent);" + "\\n"); 
		

		monitor_arr.push("////template block: new_object starts" + "\\n");
		monitor_arr.push(templ4);
		monitor_arr.push("////template block: new_object ends" + "\\n\\n");
		
		
		monitor_arr.push("endfunction // new" + " \\n\\n");
		monitor_arr.push(" \\n");
	
		monitor_build_phase(monitor,templ5);
	
		monitor_arr.push(" \\n");
	
		monitor_main_phase(monitor,templ6);

		monitor_arr.push("////template block: func_def_block starts" + "\\n");
		monitor_arr.push(templ7);
		monitor_arr.push("////template block: func_def_block ends" + "\\n\\n");
	
	
		return monitor_arr;
	
	}
	
	
	function monitor_declare_ports(monitor)
	{
		var i = 0;
	
		while(monitor.ports[i]!=null)
		{
			if(monitor.ports[i].portType=="analysis_port")
			{
				monitor_arr.push("\\t" + "uvm_analysis_port #(" + monitor.transaction + ")  " + monitor.ports[i].portId + ";" + " \\n");
			}
			else if(monitor.ports[i].portType=="PORT")
			{
				monitor_arr.push("\\t" + "uvm_blocking_get_port  " + monitor.ports[i].portId + ";" + " \\n");
			}
			else if(monitor.ports[i].portType=="IMP")
			{
				monitor_arr.push("\\t" + "uvm_analysis_imp #(" + monitor.transaction + ")  " + monitor.ports[i].portId + ";" + " \\n");
			}
			i++;
		}
	
	}
	
	
	function monitor_build_phase(monitor,templ5)
	{
	
		monitor_arr.push("function void " + monitor.comp_name + "::build_phase(uvm_phase phase);" + " \\n" + "\\tsuper.build_phase(phase);" + " \\n");
	

		if(monitor.interface == null)
		{
			monitor_arr.push('\\tif(!uvm_config_db#(virtual default_if)::get(this, "", "default_if", m_vif))' + " \\n");
			monitor_arr.push('\\t\\t\`uvm_fatal(get_full_name(), "Error in Getting interface");' + " \\n");
		}

		else
		{
			var i = 0;

			while(monitor.interface[i]!=null)
			{
				monitor_arr.push('\\tif(!uvm_config_db#(virtual ' + monitor.interface[i] +  ')::get(this, "","' + monitor.interface[i] + '", m_' + monitor.interface[i] + '))' + " \\n");
				monitor_arr.push('\\t\\t\`uvm_fatal(get_full_name(), "Error in Getting interface");' + " \\n");
				i++;
			}
		}
		
		var i = 0;
		while(monitor.ports[i]!=null)
		{
	
			monitor_arr.push("\\t" + monitor.ports[i].portId + "=" + 'new("' + monitor.ports[i].portId + '", this)' +  ";" + " \\n");
	
			i++;
		}

		monitor_arr.push("////template block: build_phase starts" + "\\n");
		monitor_arr.push(templ5);
		monitor_arr.push("////template block: build_phase ends" + "\\n\\n");

		monitor_arr.push("endfunction" + "\\n\\n");
		
	}
	

	function monitor_main_phase(monitor,templ6)
	{
	
		monitor_arr.push("task " + monitor.comp_name + "::main_phase(uvm_phase phase);" + " \\n");


		monitor_arr.push("////template block: main_phase starts" + "\\n");
		monitor_arr.push(templ6);
		monitor_arr.push("////template block: main_phase ends" + "\\n\\n");


		monitor_arr.push("endtask " + "\\n\\n");

	}
	
	
	
	//******************************************************************************************************



	
	function env_real_main(env,templ1,templ2,templ3,templ4,templ5,templ6)	
	{		
		env.contain_nodes();

		sv_arr = [];

		sv_arr.pop();


		sv_arr.push("////template block: head_block starts" + "\\n");
		sv_arr.push(templ1);
		sv_arr.push("////template block: head_block ends" + "\\n\\n");


		p_r = sv_arr.push("class " + env.comp_name + " extends uvm_env;" + "\\n");

		declare_objects(env);

		sv_arr.push("\\n");

		declare_fifos(env);


		sv_arr.push("////template block: variable_block starts" + "\\n");
		sv_arr.push(templ2);
		sv_arr.push("////template block: variable_block ends" + "\\n\\n");


		p_r = sv_arr.push("\\t" + "extern function new(string name, uvm_component parent);" + "\\n");
		p_r = sv_arr.push("\\t" + "extern virtual function void build_phase(uvm_phase phase);" + "\\n");
		p_r = sv_arr.push("\\t" + "extern virtual function void connect_phase(uvm_phase phase);" + "\\n");


		sv_arr.push("////template block: func_decl_block starts" + "\\n");
		sv_arr.push(templ3);
		sv_arr.push("////template block: func_decl_block ends" + "\\n\\n");


		p_r = sv_arr.push("\\t" + "\`uvm_component_utils(" + env.comp_name + ")" + "\\n");

		sv_arr.push("endclass\\n");

		sv_arr.push("\\n");

		p_r = sv_arr.push("function " + env.comp_name + " ::new(string name, uvm_component parent);" + "\\n");
		p_r = sv_arr.push("\\t" + "super.new(name, parent);"+ "\\n");


		sv_arr.push("////template block: new_object starts" + "\\n");
		sv_arr.push(templ4);
		sv_arr.push("////template block: new_object ends" + "\\n\\n");
		

		p_r = sv_arr.push("endfunction // new"+ "\\n");

		sv_arr.push("\\n");

		env_build_phase(env,templ5);

		sv_arr.push("\\n");

		env_connect_phase(env);


		sv_arr.push("////template block: func_def_block starts" + "\\n");
		sv_arr.push(templ6);
		sv_arr.push("////template block: func_def_block ends" + "\\n\\n");
	

		return sv_arr;
	}


	function declare_objects(env)
	{
		var i = 0;
		while(env.contain[i]!=null)
		{   
			sv_arr.push("\\t" + env.contain[i].comp_name + "  m_" + env.contain[i].comp_name + ";\\n");

			i++;
		}
	}


	function declare_fifos(env)
	{
		var i = 0;
		while(linksArray[i]!=null)
		{
			if(linksArray[i].type=="fifo")
			{
				is_of = is_object(linksArray[i].from_node,env);
				is_ot = is_object(linksArray[i].to_node,env);

				if(is_of == true || is_ot == true)
				{
					sv_arr.push("\\t" + "uvm_tlm_analysis_fifo #("  + linksArray[i].trans + ") " + linksArray[i].from_node.comp_name + "_" + linksArray[i].to_node.comp_name + "_fifo" + ";\\n");
				
				}
			}

			i++;
		}
	}


	function env_build_phase(env,templ5)
	{
		sv_arr.push("function void " + env.comp_name + "::build_phase(uvm_phase phase);" + "\\n");
		sv_arr.push("\\t" + "super.build_phase(phase);" + "\\n");

		var i = 0;
		while(nodesArray[i]!=null)
		{
			var is_o = is_object(nodesArray[i],env);

			if(is_o == true)
			{
				if(nodesArray[i].is_agent==true)
				{
					sv_arr.push("\\tm_" + nodesArray[i].comp_name + " = " + 'new("m_' + nodesArray[i].comp_name + '", ' + "this);" + "\\n");

					if(nodesArray[i].agt_mode=="UVM_ACTIVE")
					{
						sv_arr.push("\\t" + nodesArray[i].comp_name + ".is_active = UVM_ACTIVE" + "\\n");
					}

					if(nodesArray[i].agt_mode=="UVM_PASSIVE")
					{
						sv_arr.push("\\t" + nodesArray[i].comp_name + ".is_active = UVM_PASSIVE" + "\\n");
					}

				}

				else 
				{
					sv_arr.push("\\tm_" + nodesArray[i].comp_name + ' = new("m_' + nodesArray[i].comp_name + '", this);' + "\\n");
				}

			}

			i++;
		
		}

		var j = 0;
		while(linksArray[j]!=null)
		{
			if(linksArray[j].type=="fifo")
			{
				is_of = is_object(linksArray[j].from_node,env);
				is_ot = is_object(linksArray[j].to_node,env);
	
				if(is_of == true || is_ot == true)
				{
					sv_arr.push("\\t" + linksArray[j].from_node.comp_name + "_" + linksArray[j].to_node.comp_name + "_fifo" 
					+ ' = new("' + linksArray[j].from_node.comp_name + "_" + linksArray[j].to_node.comp_name + "_fifo" + '", this);' + "\\n");
				}
			}
			j++;

		}


		sv_arr.push("////template block: build_phase starts" + "\\n");
		sv_arr.push(templ5);
		sv_arr.push("////template block: build_phase ends" + "\\n\\n");


		sv_arr.push("endfunction \\n");

	}

	function env_connect_phase(env)			
	{
		sv_arr.push("function void " + env.comp_name + "::connect_phase(uvm_phase phase); \\n");
		sv_arr.push("\\t" + "super.connect_phase(phase);" + "\\n");

		var j = 0;
		while(linksArray[j]!=null)
		{
			if(linksArray[j].type=="fifo")
			{
				is_of = is_object(linksArray[j].from_node,env);
				is_ot = is_object(linksArray[j].to_node,env);

				if(is_of == true || is_ot == true)
				{
					sv_arr.push("\\tm_" + linksArray[j].from_node.comp_name + "." + linksArray[j].fromPort
					+ ".connect" + "(" + linksArray[j].fifo_name + ".analysis_export" + ");" + "\\n");

					sv_arr.push("\\tm_" + linksArray[j].to_node.comp_name + "." + linksArray[j].toPort
					+ ".connect" + "(" + linksArray[j].fifo_name + ".blocking_get_export" + ");" + "\\n");
				}               
			}

			if(linksArray[j].type=="send receive")
			{
				is_of = is_object(linksArray[j].from_node,env);
				is_ot = is_object(linksArray[j].to_node,env);

				if(is_of == true || is_ot == true)
				{
					sv_arr.push("\\tm_" + linksArray[j].from_node.comp_name + "." + linksArray[j].fromPort
					+ ".connect" + "(m_"  + linksArray[j].to_node.comp_name + "." + linksArray[j].toPort + ");" + "\\n");
				}               
			}

			j++;
		}
		
		sv_arr.push("endfunction\\n\\n");
	}


	function is_object(node,env)
	{
		env.contain_nodes();

		var is_o = false;
		var i = 0;
		while(env.contain[i] != null)
		{
			if(env.contain[i] == node)
			{
				is_o = true;
			}
			i++;
		}

		return is_o;

	}


	//***********************************************************************************************************




	function top_real()
	{

		//cut the templ
		var templ = top_templ;

		templ = templ.replace(/\\n/g,"changeLine");
		templ = templ.replace(/\\/\\/\\/\\//g,"fSlash");

		var templ1 = templ.match(/(?<=fSlashtemplate block: head_block startschangeLine).*?(?=fSlashtemplate block: head_block endschangeLine)/);
		templ1 = templ1.toString().replace(/changeLine/g,"\\n");

		var templ2 = templ.match(/(?<=fSlashtemplate block: variable_block startschangeLine).*?(?=fSlashtemplate block: variable_block endschangeLine)/);
		templ2 = templ2.toString().replace(/changeLine/g,"\\n");

		var templ3 = templ.match(/(?<=fSlashtemplate block: dut_block startschangeLine).*?(?=fSlashtemplate block: dut_block endschangeLine)/);
		templ3 = templ3.toString().replace(/changeLine/g,"\\n");


		var top_arr = [];


		top_arr.push("////template block: head_block starts" + "\\n");
		top_arr.push(templ1);
		top_arr.push("////template block: head_block ends" + "\\n\\n");

		top_arr.push("////template block: variable_block starts" + "\\n");
		top_arr.push(templ2);
		top_arr.push("////template block: variable_block ends" + "\\n\\n");

		var i = 0;
		while(myDiagram.model.nodeDataArray[i]!=null)
		{
			if(myDiagram.model.nodeDataArray[i].topArray[0] != null)
			{
				if(myDiagram.model.nodeDataArray[i].topArray[0].portId == "instantiate")
				{
					var name = myDiagram.model.nodeDataArray[i].name;
					top_arr.push("    " + name + " m_" + name + "(clk,rst_n);\\n");
				}
			}
			i++;
		}


		top_arr.push("\\n\\n");

		top_arr.push("////template block: dut_block starts" + "\\n");
		top_arr.push(templ3);
		top_arr.push("////template block: dut_block ends" + "\\n\\n");

		top_arr.push("endmodule");

		//generate text
		var text = "";
		var j = 0;
		while(top_arr[j]!=null)
		{
			text = text + top_arr[j];
			j++;
		}

		return text;

	}



	//************************************************************************************************************
	
	
	
	function driver_real_main(driver,templ1,templ2,templ3,templ4,templ5,templ6,templ7)  
	{
		driver_arr = [];

  
		driver_arr.push("////template block: head_block starts" + "\\n");
		driver_arr.push(templ1);
		driver_arr.push("////template block: head_block ends" + "\\n");


		if(driver.is_generic == false)
		{
			driver_arr.push('class ' + driver.comp_name + ' extends uvm_driver #(' + driver.transaction + ');' + " \\n");
		}
		else if(driver.is_generic == true)
		{
			driver_arr.push('class ' + driver.comp_name + ' extends uvm_component#(' + driver.transaction + ');' + " \\n");
		}

		if(driver.interface == null)
		{
			driver_arr.push('\\tvirtual default_if m_vif;' + "//this is default if" + " \\n");
		}

		else
		{
			var i = 0;
			while(driver.interface[i]!=null)
			{
				driver_arr.push('\\tvirtual ' + driver.interface[i] +' m_' + driver.interface[i] + "; \\n");
				i++;
			}
		}
	
	
		driver_declare_ports(driver);


		driver_arr.push("////template block: variable_block starts" + "\\n");
		driver_arr.push(templ2);
		driver_arr.push("////template block: variable_block ends" + "\\n\\n");

		driver_arr.push("\\t" + 'extern function new(string name, uvm_component parent);' + " \\n");
		driver_arr.push("\\t" + 'extern function void build_phase(uvm_phase phase);' + " \\n");
		driver_arr.push("\\t" + 'extern virtual task main_phase(uvm_phase phase);' + " \\n");


		driver_arr.push("////template block: func_decl_block starts" + "\\n");
		driver_arr.push(templ3);
		driver_arr.push("////template block: func_decl_block ends" + "\\n");


		driver_arr.push("\\t" + '\`uvm_component_utils(' + driver.comp_name + ')' + " \\n");

		driver_arr.push('endclass // m_driver' + " \\n\\n");
		driver_arr.push(" \\n");

	
		driver_arr.push("function " + driver.comp_name + "::new(string name, uvm_component parent);" + " \\n" + 
		"\\t" + "super.new(name, parent);" + " \\n");

		driver_arr.push("////template block: new_object starts" + "\\n");
		driver_arr.push(templ4);
		driver_arr.push("////template block: new_object ends" + "\\n");


		driver_arr.push("endfunction // new" + " \\n\\n");


		driver_build_phase(driver,templ5);

		driver_main_phase(driver,templ6);
		

		driver_arr.push("////template block: func_def_block starts" + "\\n");
		driver_arr.push(templ7);
		driver_arr.push("////template block: func_def_block ends" + "\\n");
	
	
		return driver_arr;
	}
	
	
	function driver_declare_ports(driver)		
	{
		var i = 0;
		while(driver.ports[i]!=null)
		{
			if(driver.ports[i].portType=="analysis_port")
			{
				driver_arr.push("\\t" + "uvm_analysis_port #(" + driver.ports[i].portTrans + ")  " + driver.ports[i].portId + ";" + " \\n");
			}
			else if(driver.ports[i].portType=="PORT")
			{
				driver_arr.push("\\t" + "uvm_blocking_get_port #(" + driver.ports[i].portTrans + ")  " + driver.ports[i].portId + ";" + " \\n");
			}
			else if(driver.ports[i].portType=="IMP")
			{
				driver_arr.push("\\t" + "uvm_analysis_imp #(" + driver.ports[i].portTrans + ")  " + driver.ports[i].portId + ";" + " \\n");
			}
			i++;
		}
	
	}
	
	
	function driver_build_phase(driver,templ5)
	{
	
		driver_arr.push("function void " + driver.comp_name + "::build_phase(uvm_phase phase);" + " \\n" + "\\tsuper.build_phase(phase);" + " \\n");
	

		if(driver.interface == null)
		{
			driver_arr.push('\\tif(!uvm_config_db#(virtual default_if)::get(this, "", "default_if", m_vif))' + " \\n");
			driver_arr.push('\\t\\t\`uvm_fatal(get_full_name(), "Error in Getting interface");' + " \\n");
		}

		else
		{
			var i = 0;
			while(driver.interface[i]!=null)
			{
				driver_arr.push('\\tif(!uvm_config_db#(virtual ' + driver.interface[i] +  ')::get(this, "", ' + driver.interface[i] + ', m_' + driver.interface[i] + '))' + " \\n");
				driver_arr.push('\\t\\t\`uvm_fatal(get_full_name(), "Error in Getting interface");' + " \\n");
				i++;
			}
		}

	
		var i = 0;
		while(driver.ports[i]!=null)
		{
	
			driver_arr.push("\\t" + driver.ports[i].portId + "=" + 'new("' + driver.ports[i].portId + '", this)' +  ";" + " \\n");
	
			i++;
		}
	

		driver_arr.push("////template block: build_phase starts" + "\\n");
		driver_arr.push(templ5);
		driver_arr.push("////template block: build_phase ends" + "\\n\\n");


		driver_arr.push('endfunction // build_phase' + " \\n\\n");
	
	}
	
	function driver_main_phase(driver,templ6)
	{	
		driver_arr.push("task " + driver.comp_name + "::main_phase(uvm_phase phase);" + " \\n");
				
		driver_arr.push("////template block: main_phase starts" + "\\n");
		driver_arr.push(templ6);
		driver_arr.push("////template block: main_phase ends" + "\\n\\n");


		driver_arr.push("\\n" + "endtask \\n\\n");
	
	}



	//*********************************************************************************************************




	function transaction_real(name)
	{
		var i = 0;
		while(revised_templ[i] != null)
		{
			var v_t = revised_templ[i];
			if(v_t[0] == this.comp_name)
			{
				var templ = v_t[1];
			}
			i++;
	
		}


		//cut the templ
		var templ = transaction_templ;
		

		templ = templ.replace(/\\n/g,"changeLine");
		templ = templ.replace(/\\/\\/\\/\\//g,"fSlash");

		var templ1 = templ.match(/(?<=fSlashtemplate block: head_block startschangeLine).*?(?=fSlashtemplate block: head_block endschangeLine)/);
		templ1 = templ1.toString().replace(/changeLine/g,"\\n");

		var templ2 = templ.match(/(?<=fSlashtemplate block: variable_block startschangeLine).*?(?=fSlashtemplate block: variable_block endschangeLine)/);
		templ2 = templ2.toString().replace(/changeLine/g,"\\n");

		var templ3 = templ.match(/(?<=fSlashtemplate block: func_decl_block startschangeLine).*?(?=fSlashtemplate block: func_decl_block endschangeLine)/);
		templ3 = templ3.toString().replace(/changeLine/g,"\\n");

		var templ4 = templ.match(/(?<=fSlashtemplate block: func_def_block startschangeLine).*?(?=fSlashtemplate block: func_def_block endschangeLine)/);
		templ4 = templ4.toString().replace(/changeLine/g,"\\n");

		var transaction_arr = [];


		transaction_arr.push("////template block: head_block starts" + "\\n");
		transaction_arr.push(templ1);
		transaction_arr.push("////template block: head_block ends" + "\\n\\n");


		transaction_arr.push("class " + name + " extends uvm_sequence_item; \\n");


		transaction_arr.push("////template block: variable_block starts" + "\\n");
		transaction_arr.push(templ2);
		transaction_arr.push("////template block: variable_block ends" + "\\n\\n");


		transaction_arr.push("////template block: func_decl_block starts" + "\\n");
		transaction_arr.push(templ3);
		transaction_arr.push("////template block: func_decl_block ends" + "\\n\\n");


		transaction_arr.push("endclass //transaction\\n");

		transaction_arr.push("\\n\\n");

		transaction_arr.push('function ' + name + '::new(string name = ' + name + '); \\n');
		transaction_arr.push('super.new(name); \\n');
		transaction_arr.push('endfunction \\n\\n');


		transaction_arr.push("////template block: func_def_block starts" + "\\n");
		transaction_arr.push(templ4);
		transaction_arr.push("////template block: func_def_block ends" + "\\n\\n");


		var transaction_text = "";
		var i = 0;
		while(transaction_arr[i] != null)
		{
			transaction_text = transaction_text + transaction_arr[i];
			i++;
		}


		return transaction_text;
	
	}
	



	//**********************************************************************************************************
	



	function interface_real(name)
	{

		//cut the templ
		var templ = interface_templ;

		var i = 0;
		while(revised_templ[i] != null)
		{
			var v_t = revised_templ[i];
			if(v_t[0] == this.comp_name)
			{
				var templ = v_t[1];
			}
			i++;
	
		}

		templ = templ.replace(/\\n/g,"changeLine");
		templ = templ.replace(/\\/\\/\\/\\//g,"fSlash");

		var templ1 = templ.match(/(?<=fSlashtemplate block: head_block startschangeLine).*?(?=fSlashtemplate block: head_block endschangeLine)/);
		templ1 = templ1.toString().replace(/changeLine/g,"\\n");

		var templ2 = templ.match(/(?<=fSlashtemplate block: variable_block startschangeLine).*?(?=fSlashtemplate block: variable_block endschangeLine)/);
		templ2 = templ2.toString().replace(/changeLine/g,"\\n");

		var templ3 = templ.match(/(?<=fSlashtemplate block: func_decl_block startschangeLine).*?(?=fSlashtemplate block: func_decl_block endschangeLine)/);
		templ3 = templ3.toString().replace(/changeLine/g,"\\n");

		var templ4 = templ.match(/(?<=fSlashtemplate block: func_def_block startschangeLine).*?(?=fSlashtemplate block: func_def_block endschangeLine)/);
		templ4 = templ4.toString().replace(/changeLine/g,"\\n");

		var templ5 = templ.match(/(?<=fSlashtemplate block: cb_block startschangeLine).*?(?=fSlashtemplate block: cb_block endschangeLine)/);
		templ5 = templ5.toString().replace(/changeLine/g,"\\n");

		var interface_arr = [];


		interface_arr.push("////template block: head_block starts" + "\\n");
		interface_arr.push(templ1);
		interface_arr.push("////template block: head_block ends" + "\\n\\n");


		interface_arr.push("interface " + name + "(clk,rst_n); \\n");


		interface_arr.push("////template block: variable_block starts" + "\\n");
		interface_arr.push(templ2);
		interface_arr.push("////template block: variable_block ends" + "\\n\\n");


		interface_arr.push("////template block: cb_block starts" + "\\n");
		interface_arr.push(templ5);
		interface_arr.push("////template block: cb_block ends" + "\\n\\n");


		interface_arr.push("////template block: func_decl_block starts" + "\\n");
		interface_arr.push(templ3);
		interface_arr.push("////template block: func_decl_block ends" + "\\n\\n");


		interface_arr.push("endinterface //interface \\n\\n");


		interface_arr.push("////template block: func_def_block starts" + "\\n");
		interface_arr.push(templ4);
		interface_arr.push("////template block: func_def_block ends" + "\\n\\n");


		var interface_text = "";
		var i = 0;
		while(interface_arr[i] != null)
		{
			interface_text = interface_text + interface_arr[i];
			i++;
		}


		return interface_text;
	
	}
	
	
	//**********************************************************************************************************
	
	
	"use strict";
	/*
	*  Copyright (C) 1998-2019 by Northwoods Software Corporation. All Rights Reserved.
	*/
	
	/**
	  This class implements an inspector for GoJS model data objects.
	  The constructor takes three arguments:
		{string} divid a string referencing the HTML ID of the to-be inspector's div.
		{Diagram} diagram a reference to a GoJS Diagram.
		{Object} options An optional JS Object describing options for the inspector.
	
	  Options:
		inspectSelection {boolean} Default true, whether to automatically show and populate the Inspector
								   with the currently selected Diagram Part. If set to false, the inspector won't show anything
								   until you call Inspector.inspectObject(object) with a Part or JavaScript object as the argument.
		includesOwnProperties {boolean} Default true, whether to list all properties currently on the inspected data object.
		properties {Object} An object of string:Object pairs representing propertyName:propertyOptions.
							Can be used to include or exclude additional properties.
		propertyModified function(propertyName, newValue) a callback
		multipleSelection {boolean} Default false, whether to allow multiple selection and change the properties of all the selected instead of
									the single first object
		showAllProperties {boolean} Default false, whether properties that are shown with multipleSelection use the intersect of the properties when false or the union when true
									only affects if multipleSelection is true
		showSize {number} Defaults 0, shows how many nodes are showed when selecting multiple nodes
						  when its lower than 1, it shows all nodes
	
	  Options for properties:
		show: {boolean|function} a boolean value to show or hide the property from the inspector, or a predicate function to show conditionally.
		readOnly: {boolean|function} whether or not the property is read-only
		type: {string} a string describing the data type. Supported values: "string|number|boolean|color|arrayofnumber|point|rect|size|spot|margin|select"
		defaultValue: {*} a default value for the property. Defaults to the empty string.
		choices: {Array|function} when type == "select", the Array of choices to use or a function that returns the Array of choices.
	
	  Example usage of Inspector:
	
	  var inspector = new Inspector("myInspector", myDiagram,
		{
		  includesOwnProperties: false,
		  properties: {
			"key": { show: Inspector.showIfPresent, readOnly: true },
			"comments": { show: Inspector.showIfNode  },
			"LinkComments": { show: Inspector.showIfLink },
			"chosen": { show: Inspector.showIfNode, type: "checkbox" },
			"state": { show: Inspector.showIfNode, type: "select", choices: ["Stopped", "Parked", "Moving"] }
		  }
		});
	
	  This is the basic HTML Structure that the Inspector creates within the given DIV element:
	
	  <div id="divid" class="inspector">
		<tr>
		  <td>propertyName</td>
		  <td><input value=propertyValue /></td>
		</tr>
		...
	  </div>
	
	*/
	function Inspector(divid, diagram, options) {
	  var mainDiv = document.getElementById(divid);
	  mainDiv.className = "inspector";
	  mainDiv.innerHTML = "";
	  this._div = mainDiv;
	  this._diagram = diagram;
	  this._inspectedProperties = {};
	  this._multipleProperties = {};
	
	  // Either a GoJS Part or a simple data object, such as Model.modelData
	  this.inspectedObject = null;
	
	  // Inspector options defaults:
	  this.includesOwnProperties = true;
	  this.declaredProperties = {};
	  this.inspectsSelection = true;
	  this.propertyModified = null;
	  this.multipleSelection = false;
	  this.showAllProperties = false;
	  this.showSize = 0;
	
	  if (options !== undefined) {
		if (options["includesOwnProperties"] !== undefined) this.includesOwnProperties = options["includesOwnProperties"];
		if (options["properties"] !== undefined) this.declaredProperties = options["properties"];
		if (options["inspectSelection"] !== undefined) this.inspectsSelection = options["inspectSelection"];
		if (options["propertyModified"] !== undefined) this.propertyModified = options["propertyModified"];
		if (options['multipleSelection'] !== undefined) this.multipleSelection = options['multipleSelection'];
		if (options['showAllProperties'] !== undefined) this.showAllProperties = options['showAllProperties'];
		if (options['showSize'] !== undefined) this.showSize = options['showSize'];
	  }
	
	  var self = this;
	  diagram.addModelChangedListener(function(e) {
		if (e.isTransactionFinished) self.inspectObject();
	  });
	  if (this.inspectsSelection) {
		diagram.addDiagramListener("ChangedSelection", function(e) { self.inspectObject(); });
	  }
	}
	
	// Some static predicates to use with the "show" property.
	Inspector.showIfNode = function(part) { return part instanceof go.Node };
	Inspector.showIfLink = function(part) { return part instanceof go.Link };
	Inspector.showIfGroup = function(part) { return part instanceof go.Group };
	
	// Only show the property if its present. Useful for "key" which will be shown on Nodes and Groups, but normally not on Links
	Inspector.showIfPresent = function(data, propname) {
	  if (data instanceof go.Part) data = data.data;
	  return typeof data === "object" && data[propname] !== undefined;
	};
	
	/**
	* Update the HTML state of this Inspector given the properties of the {@link #inspectedObject}.
	* @param {Object} object is an optional argument, used when {@link #inspectSelection} is false to
	*                        set {@link #inspectedObject} and show and edit that object's properties.
	*/
	Inspector.prototype.inspectObject = function(object) {
	  var inspectedObject = null;
	  var inspectedObjects = null;
	  if (object === null) return;
	  if (object === undefined) {
		if (this.inspectsSelection) {
		  if (this.multipleSelection) { // gets the selection if multiple selection is true
			inspectedObjects = this._diagram.selection;
		  } else { // otherwise grab the first object
			inspectedObject = this._diagram.selection.first();
		  }
		} else { // if there is a single inspected object
		  inspectedObject = this.inspectedObject;
		}
	  } else { // if object was passed in as a parameter
		inspectedObject = object;
	  }
	  if (inspectedObjects && inspectedObjects.count === 1) {
		inspectedObject = inspectedObjects.first();
	  }
	  if (inspectedObjects && inspectedObjects.count <= 1) {
		inspectedObjects = null;
	  }
	
	  // single object or no objects
	  if (!inspectedObjects || !this.multipleSelection) {
		if (inspectedObject === null) {
		  this.inspectedObject = inspectedObject;
		  this.updateAllHTML();
		  return;
		}
	
		this.inspectedObject = inspectedObject;
		if (this.inspectObject === null) return;
		var mainDiv = this._div;
		mainDiv.innerHTML = '';
	
		// use either the Part.data or the object itself (for model.modelData)
		var data = (inspectedObject instanceof go.Part) ? inspectedObject.data : inspectedObject;
		if (!data) return;
		// Build table:
		var table = document.createElement('table');
		var tbody = document.createElement('tbody');
		this._inspectedProperties = {};
		this.tabIndex = 0;
		var declaredProperties = this.declaredProperties;
	
		// Go through all the properties passed in to the inspector and show them, if appropriate:
		for (var name in declaredProperties) {
		  var desc = declaredProperties[name];
		  if (!this.canShowProperty(name, desc, inspectedObject)) continue;
		  var val = this.findValue(name, desc, data);
		  tbody.appendChild(this.buildPropertyRow(name, val));
		}
		// Go through all the properties on the model data and show them, if appropriate:
		if (this.includesOwnProperties) {
		  for (var k in data) {
			if (k === '__gohashid') continue; // skip internal GoJS hash property
			if (this._inspectedProperties[k]) continue; // already exists
			if (declaredProperties[k] && !this.canShowProperty(k, declaredProperties[k], inspectedObject)) continue;
			tbody.appendChild(this.buildPropertyRow(k, data[k]));
		  }
		}
	
		table.appendChild(tbody);
		mainDiv.appendChild(table);
	  } else { // multiple objects selected
		var mainDiv = this._div;
		mainDiv.innerHTML = '';
		var shared = new go.Map(); // for properties that the nodes have in common
		var properties = new go.Map(); // for adding properties
		var all = new go.Map(); // used later to prevent changing properties when unneeded
		var it = inspectedObjects.iterator;
		// Build table:
		var table = document.createElement('table');
		var tbody = document.createElement('tbody');
		this._inspectedProperties = {};
		this.tabIndex = 0;
		var declaredProperties = this.declaredProperties;
		it.next();
		inspectedObject = it.value;
		this.inspectedObject = inspectedObject;
		var data = (inspectedObject instanceof go.Part) ? inspectedObject.data : inspectedObject;
		if (data) { // initial pass to set shared and all
		  // Go through all the properties passed in to the inspector and add them to the map, if appropriate:
		  for (var name in declaredProperties) {
			var desc = declaredProperties[name];
			if (!this.canShowProperty(name, desc, inspectedObject)) continue;
			var val = this.findValue(name, desc, data);
			if (val === '' && desc && desc.type === 'checkbox') {
			  shared.add(name, false);
			  all.add(name, false);
			} else {
			  shared.add(name, val);
			  all.add(name, val);
			}
		  }
		  // Go through all the properties on the model data and add them to the map, if appropriate:
		  if (this.includesOwnProperties) {
			for (var k in data) {
			  if (k === '__gohashid') continue; // skip internal GoJS hash property
			  if (this._inspectedProperties[k]) continue; // already exists
			  if (declaredProperties[k] && !this.canShowProperty(k, declaredProperties[k], inspectedObject)) continue;
			  shared.add(k, data[k]);
			  all.add(k, data[k]);
			}
		  }
		}
		var nodecount = 2;
		while (it.next() && (this.showSize < 1 || nodecount <= this.showSize)) { // grabs all the properties from the other selected objects
		  properties.clear();
		  inspectedObject = it.value;
		  if (inspectedObject) {
			// use either the Part.data or the object itself (for model.modelData)
			data = (inspectedObject instanceof go.Part) ? inspectedObject.data : inspectedObject;
			if (data) {
			  // Go through all the properties passed in to the inspector and add them to properties to add, if appropriate:
			  for (var name in declaredProperties) {
				var desc = declaredProperties[name];
				if (!this.canShowProperty(name, desc, inspectedObject)) continue;
				var val = this.findValue(name, desc, data);
				if (val === '' && desc && desc.type === 'checkbox') {
				  properties.add(name, false);
				} else {
				  properties.add(name, val);
				}
			  }
			  // Go through all the properties on the model data and add them to properties to add, if appropriate:
			  if (this.includesOwnProperties) {
				for (var k in data) {
				  if (k === '__gohashid') continue; // skip internal GoJS hash property
				  if (this._inspectedProperties[k]) continue; // already exists
				  if (declaredProperties[k] && !this.canShowProperty(k, declaredProperties[k], inspectedObject)) continue;
				  properties.add(k, data[k]);
				}
			  }
			}
		  }
		  if (!this.showAllProperties) {
			// Cleans up shared map with properties that aren't shared between the selected objects
			// Also adds properties to the add and shared maps if applicable
			var addIt = shared.iterator;
			var toRemove = [];
			while (addIt.next()) {
			  if (properties.has(addIt.key)) {
				var newVal = all.get(addIt.key) + '|' + properties.get(addIt.key);
				all.set(addIt.key, newVal);
				if ((declaredProperties[addIt.key] && declaredProperties[addIt.key].type !== 'color'
				  && declaredProperties[addIt.key].type !== 'checkbox' && declaredProperties[addIt.key].type !== 'select')
				  || !declaredProperties[addIt.key]) { // for non-string properties i.e color
				  newVal = shared.get(addIt.key) + '|' + properties.get(addIt.key);
				  shared.set(addIt.key, newVal);
				}
			  } else { // toRemove array since addIt is still iterating
				toRemove.push(addIt.key);
			  }
			}
			for (var i = 0; i < toRemove.length; i++) { // removes anything that doesn't showAllPropertiess
			  shared.remove(toRemove[i]);
			  all.remove(toRemove[i]);
			}
		  } else {
			// Adds missing properties to all with the correct amount of seperators
			var addIt = properties.iterator;
			while (addIt.next()) {
			  if (all.has(addIt.key)) {
				if ((declaredProperties[addIt.key] && declaredProperties[addIt.key].type !== 'color'
				  && declaredProperties[addIt.key].type !== 'checkbox' && declaredProperties[addIt.key].type !== 'select')
				  || !declaredProperties[addIt.key]) { // for non-string properties i.e color
				  var newVal = all.get(addIt.key) + '|' + properties.get(addIt.key);
				  all.set(addIt.key, newVal);
				}
			  } else {
				var newVal = '';
				for (var i = 0; i < nodecount - 1; i++) newVal += '|';
				newVal += properties.get(addIt.key);
				all.set(addIt.key, newVal);
			  }
			}
			// Adds bars in case properties is not in all
			addIt = all.iterator;
			while (addIt.next()) {
			  if (!properties.has(addIt.key)) {
				if ((declaredProperties[addIt.key] && declaredProperties[addIt.key].type !== 'color'
				  && declaredProperties[addIt.key].type !== 'checkbox' && declaredProperties[addIt.key].type !== 'select')
				  || !declaredProperties[addIt.key]) { // for non-string properties i.e color
				  var newVal = all.get(addIt.key) + '|';
				  all.set(addIt.key, newVal);
				}
			  }
			}
		  }
		  nodecount++;
		}
		// builds the table property rows and sets multipleProperties to help with updateall
		var mapIt;
		if (!this.showAllProperties) mapIt = shared.iterator;
		else mapIt = all.iterator;
		while (mapIt.next()) {
		  tbody.appendChild(this.buildPropertyRow(mapIt.key, mapIt.value)); // shows the properties that are allowed
		}
		table.appendChild(tbody);
		mainDiv.appendChild(table);
		var allIt = all.iterator;
		while (allIt.next()) {
		  this._multipleProperties[allIt.key] = allIt.value; // used for updateall to know which properties to change
		}
	  }
	};
	
	/**
	* @ignore
	* This predicate should be false if the given property should not be shown.
	* Normally it only checks the value of "show" on the property descriptor.
	* The default value is true.
	* @param {string} propertyName the property name
	* @param {Object} propertyDesc the property descriptor
	* @param {Object} inspectedObject the data object
	* @return {boolean} whether a particular property should be shown in this Inspector
	*/
	Inspector.prototype.canShowProperty = function(propertyName, propertyDesc, inspectedObject) {
	  if (propertyDesc.show === false) return false;
	  // if "show" is a predicate, make sure it passes or do not show this property
	  if (typeof propertyDesc.show === "function") return propertyDesc.show(inspectedObject, propertyName);
	  return true;
	}
	
	/**
	* @ignore
	* This predicate should be false if the given property should not be editable by the user.
	* Normally it only checks the value of "readOnly" on the property descriptor.
	* The default value is true.
	* @param {string} propertyName the property name
	* @param {Object} propertyDesc the property descriptor
	* @param {Object} inspectedObject the data object
	* @return {boolean} whether a particular property should be shown in this Inspector
	*/
	Inspector.prototype.canEditProperty = function(propertyName, propertyDesc, inspectedObject) {
	  if (this._diagram.isReadOnly || this._diagram.isModelReadOnly) return false;
	  // assume property values that are functions of Objects \\nbe edited
	  var data = (inspectedObject instanceof go.Part) ? inspectedObject.data : inspectedObject;
	  var valtype = typeof data[propertyName];
	  if (valtype === "function") return false;
	  if (propertyDesc) {
		if (propertyDesc.readOnly === true) return false;
		// if "readOnly" is a predicate, make sure it passes or do not show this property
		if (typeof propertyDesc.readOnly === "function") return !propertyDesc.readOnly(inspectedObject, propertyName);
	  }
	  return true;
	}
	
	/**
	 * @ignore
	 * @param {any} propName
	 * @param {any} propDesc
	 * @param {any} data
	 * @return {any}
	 */
	Inspector.prototype.findValue = function(propName, propDesc, data) {
	  var val = '';
	  if (propDesc && propDesc.defaultValue !== undefined) val = propDesc.defaultValue;
	  if (data[propName] !== undefined) val = data[propName];
	  if (val === undefined) return '';
	  return val;
	}
	
	/**
	* @ignore
	* This sets this._inspectedProperties[propertyName] and creates the HTML table row:
	*    <tr>
	*      <td>propertyName</td>
	*      <td><input value=propertyValue /></td>
	*    </tr>
	* @param {string} propertyName the property name
	* @param {*} propertyValue the property value
	* @return the table row
	*/
	Inspector.prototype.buildPropertyRow = function(propertyName, propertyValue) {
	  var mainDiv = this._div;
	  var tr = document.createElement("tr");
	
	  var td1 = document.createElement("td");
	  td1.textContent = propertyName;
	  tr.appendChild(td1);
	
	  var td2 = document.createElement("td");
	  var decProp = this.declaredProperties[propertyName];
	  var input = null;
	  var self = this;
	  function updateall() { self.updateAllProperties(); }
	
	  if (decProp && decProp.type === "select") {
		input = document.createElement("select");
		this.updateSelect(decProp, input, propertyName, propertyValue);
		input.addEventListener("change", updateall);
	  } else {
		input = document.createElement("input");
	
		input.value = this.convertToString(propertyValue);
		if (decProp) {
		  var t = decProp.type;
		  if (t !== 'string' && t !== 'number' && t !== 'boolean' &&
			t !== 'arrayofnumber' && t !== 'point' && t !== 'size' &&
			t !== 'rect' && t !== 'spot' && t !== 'margin') {
			input.setAttribute("type", decProp.type);
		  }
		  if (decProp.type === "color") {
			if (input.type === "color") {
			  input.value = this.convertToColor(propertyValue);
			  // input.addEventListener("input", updateall);
			  input.addEventListener("change", updateall);
			}
		  } if (decProp.type === "checkbox") {
			input.checked = !!propertyValue;
			input.addEventListener("change", updateall);
		  }
		}
		if (input.type !== "color") input.addEventListener("blur", updateall);
	  }
	
	  if (input) {
		input.tabIndex = this.tabIndex++;
		input.disabled = !this.canEditProperty(propertyName, decProp, this.inspectedObject);
		td2.appendChild(input);
	  }
	  tr.appendChild(td2);
	
	  this._inspectedProperties[propertyName] = input;
	  return tr;
	};
	
	/**
	* @ignore
	* HTML5 color input will only take hex,
	* so var HTML5 canvas convert the color into hex format.
	* This converts "rgb(255, 0, 0)" into "#FF0000", etc.
	* @param {string} propertyValue
	* @return {string}
	*/
	Inspector.prototype.convertToColor = function(propertyValue) {
	  var ctx = document.createElement("canvas").getContext("2d");
	  ctx.fillStyle = propertyValue;
	  return ctx.fillStyle;
	};
	
	/**
	* @ignore
	* @param {string}
	* @return {Array.<number>}
	*/
	Inspector.prototype.convertToArrayOfNumber = function(propertyValue) {
	  if (propertyValue === "null") return null;
	  var split = propertyValue.split(' ');
	  var arr = [];
	  for (var i = 0; i < split.length; i++) {
		var str = split[i];
		if (!str) continue;
		arr.push(parseFloat(str));
	  }
	  return arr;
	};
	
	/**
	* @ignore
	* @param {*}
	* @return {string}
	*/
	Inspector.prototype.convertToString = function(x) {
	  if (x === undefined) return "undefined";
	  if (x === null) return "null";
	  if (x instanceof go.Point) return go.Point.stringify(x);
	  if (x instanceof go.Size) return go.Size.stringify(x);
	  if (x instanceof go.Rect) return go.Rect.stringify(x);
	  if (x instanceof go.Spot) return go.Spot.stringify(x);
	  if (x instanceof go.Margin) return go.Margin.stringify(x);
	  if (x instanceof go.List) return this.convertToString(x.toArray());
	  if (Array.isArray(x)) {
		var str = "";
		for (var i = 0; i < x.length; i++) {
		  if (i > 0) str += " ";
		  var v = x[i];
		  str += this.convertToString(v);
		}
		return str;
	  }
	  return x.toString();
	};
	
	/**
	* @ignore
	* Update all of the HTML in this Inspector.
	*/
	Inspector.prototype.updateAllHTML = function() {
	  var inspectedProps = this._inspectedProperties;
	  var diagram = this._diagram;
	  var isPart = this.inspectedObject instanceof go.Part;
	  var data = isPart ? this.inspectedObject.data : this.inspectedObject;
	  if (!data) {  // clear out all of the fields
		for (var name in inspectedProps) {
		  var input = inspectedProps[name];
		  if (input instanceof HTMLSelectElement) {
			input.innerHTML = "";
		  } else if (input.type === "color") {
			input.value = "#000000";
		  } else if (input.type === "checkbox") {
			input.checked = false;
		  } else {
			input.value = "";
		  }
	
		}
	  } else {
		for (var name in inspectedProps) {
		  var input = inspectedProps[name];
		  var propertyValue = data[name];
		  if (input instanceof HTMLSelectElement) {
			var decProp = this.declaredProperties[name];
			this.updateSelect(decProp, input, name, propertyValue);
		  } else if (input.type === "color") {
			input.value = this.convertToColor(propertyValue);
		  } else if (input.type === "checkbox") {
			input.checked = !!propertyValue;
		  } else {
			input.value = this.convertToString(propertyValue);
		  }
		}
	  }
	}
	
	/**
	* @ignore
	* Update an HTMLSelectElement with an appropriate list of choices, given the propertyName
	*/
	Inspector.prototype.updateSelect = function(decProp, select, propertyName, propertyValue) {
	  select.innerHTML = "";  // clear out anything that was there
	  var choices = decProp.choices;
	  if (typeof choices === "function") choices = choices(this.inspectedObject, propertyName);
	  if (!Array.isArray(choices)) choices = [];
	  decProp.choicesArray = choices;  // remember list of actual choice values (not strings)
	  for (var i = 0; i < choices.length; i++) {
		var choice = choices[i];
		var opt = document.createElement("option");
		opt.text = this.convertToString(choice);
		select.add(opt, null);
	  }
	  select.value = this.convertToString(propertyValue);
	}
	
	/**
	* @ignore
	* Update all of the data properties of {@link #inspectedObject} according to the
	* current values held in the HTML input elements.
	*/
	Inspector.prototype.updateAllProperties = function() {
	  var inspectedProps = this._inspectedProperties;
	  var diagram = this._diagram;
	  if (diagram.selection.count === 1 || !this.multipleSelection) { // single object update
		var isPart = this.inspectedObject instanceof go.Part;
		var data = isPart ? this.inspectedObject.data : this.inspectedObject;
		if (!data) return;  // must not try to update data when there's no data!
	
		diagram.startTransaction('set all properties');
		for (var name in inspectedProps) {
		  var input = inspectedProps[name];
		  var value = input.value;
	
		  // don't update "readOnly" data properties
		  var decProp = this.declaredProperties[name];
		  if (!this.canEditProperty(name, decProp, this.inspectedObject)) continue;
	
		  // If it's a boolean, or if its previous value was boolean,
		  // parse the value to be a boolean and then update the input.value to match
		  var type = '';
		  if (decProp !== undefined && decProp.type !== undefined) {
			type = decProp.type;
		  }
		  if (type === '') {
			var oldval = data[name];
			if (typeof oldval === 'boolean') type = 'boolean'; // infer boolean
			else if (typeof oldval === 'number') type = 'number';
			else if (oldval instanceof go.Point) type = 'point';
			else if (oldval instanceof go.Size) type = 'size';
			else if (oldval instanceof go.Rect) type = 'rect';
			else if (oldval instanceof go.Spot) type = 'spot';
			else if (oldval instanceof go.Margin) type = 'margin';
		  }
	
		  // convert to specific type, if needed
		  switch (type) {
			case 'boolean': value = !(value === false || value === 'false' || value === '0'); break;
			case 'number': value = parseFloat(value); break;
			case 'arrayofnumber': value = this.convertToArrayOfNumber(value); break;
			case 'point': value = go.Point.parse(value); break;
			case 'size': value = go.Size.parse(value); break;
			case 'rect': value = go.Rect.parse(value); break;
			case 'spot': value = go.Spot.parse(value); break;
			case 'margin': value = go.Margin.parse(value); break;
			case 'checkbox': value = input.checked; break;
			case 'select': value = decProp.choicesArray[input.selectedIndex]; break;
		  }
	
		  // in case parsed to be different, such as in the case of boolean values,
		  // the value shown should match the actual value
		  input.value = value;
	
		  // modify the data object in an undo-able fashion
		  diagram.model.setDataProperty(data, name, value);
	
		  // notify any listener
		  if (this.propertyModified !== null) this.propertyModified(name, value, this);
		}
		diagram.commitTransaction('set all properties');
	  } else { // selection object update
		diagram.startTransaction('set all properties');
		for (var name in inspectedProps) {
		  var input = inspectedProps[name];
		  var value = input.value;
		  var arr1 = value.split('|');
		  var arr2 = [];
		  if (this._multipleProperties[name]) {
			// don't split if it is union and its checkbox type
			if (this.declaredProperties[name] && this.declaredProperties[name].type === 'checkbox' && this.showAllProperties) {
			  arr2.push(this._multipleProperties[name]);
			} else {
			  arr2 = this._multipleProperties[name].toString().split('|');
			}
		  }
		  var it = diagram.selection.iterator;
		  var change = false;
		  if (this.declaredProperties[name] && this.declaredProperties[name].type === 'checkbox') change = true; // always change checkbox
		  if (arr1.length < arr2.length // i.e Alpha|Beta -> Alpha procs the change
			&& (!this.declaredProperties[name] // from and to links
			  || !(this.declaredProperties[name] // do not change color checkbox and choices due to them always having less
				&& (this.declaredProperties[name].type === 'color' || this.declaredProperties[name].type === 'checkbox' || this.declaredProperties[name].type === 'choices')))) {
			change = true;
		  } else { // standard detection in change in properties
			for (var j = 0; j < arr1.length && j < arr2.length; j++) {
			  if (!(arr1[j] === arr2[j])
				&& !(this.declaredProperties[name] && this.declaredProperties[name].type === 'color' && arr1[j].toLowerCase() === arr2[j].toLowerCase())) {
				change = true;
			  }
			}
		  }
		  if (change) { // only change properties it needs to change instead all of them
			for (var i = 0; i < diagram.selection.count; i++) {
			  it.next();
			  var isPart = it.value instanceof go.Part;
			  var data = isPart ? it.value.data : it.value;
	
			  if (data) { // ignores the selected node if there is no data
				if (i < arr1.length) value = arr1[i];
				else value = arr1[0];
	
				// don't update "readOnly" data properties
				var decProp = this.declaredProperties[name];
				if (!this.canEditProperty(name, decProp, it.value)) continue;
	
				// If it's a boolean, or if its previous value was boolean,
				// parse the value to be a boolean and then update the input.value to match
				var type = '';
				if (decProp !== undefined && decProp.type !== undefined) {
				  type = decProp.type;
				}
				if (type === '') {
				  var oldval = data[name];
				  if (typeof oldval === 'boolean') type = 'boolean'; // infer boolean
				  else if (typeof oldval === 'number') type = 'number';
				  else if (oldval instanceof go.Point) type = 'point';
				  else if (oldval instanceof go.Size) type = 'size';
				  else if (oldval instanceof go.Rect) type = 'rect';
				  else if (oldval instanceof go.Spot) type = 'spot';
				  else if (oldval instanceof go.Margin) type = 'margin';
				}
	
				// convert to specific type, if needed
				switch (type) {
				  case 'boolean': value = !(value === false || value === 'false' || value === '0'); break;
				  case 'number': value = parseFloat(value); break;
				  case 'arrayofnumber': value = this.convertToArrayOfNumber(value); break;
				  case 'point': value = go.Point.parse(value); break;
				  case 'size': value = go.Size.parse(value); break;
				  case 'rect': value = go.Rect.parse(value); break;
				  case 'spot': value = go.Spot.parse(value); break;
				  case 'margin': value = go.Margin.parse(value); break;
				  case 'checkbox': value = input.checked; break;
				  case 'select': value = decProp.choicesArray[input.selectedIndex]; break;
				}
	
				// in case parsed to be different, such as in the case of boolean values,
				// the value shown should match the actual value
				input.value = value;
	
				// modify the data object in an undo-able fashion
				diagram.model.setDataProperty(data, name, value);
	
				// notify any listener
				if (this.propertyModified !== null) this.propertyModified(name, value, this);
			  }
			}
		  }
		}
		diagram.commitTransaction('set all properties');
	  }
	};
	
	
	
	//******************************************************************************************************
	
	
	class node
	{   
		constructor(name,key)
		{
			this.name = name;
			this.comp_name = "uNdefined" + undefined_num;
			undefined_num++;
			this.key = key;
			// this.group = myDiagram.model.findNodeDataForKey(key).group;
			this.is_object = null;
			this.is_agent = null;
		}
	
	}
	
	class driver extends node
	{
		constructor(name,key,is_generic)
		{
			super();

			this.name = name;
			this.comp_name = name;

			if(is_generic == false)
			{
				if(name == "Driver")
				{
					this.comp_name = "driver" + driver_num;
				}
				else
				{
					this.comp_name = name;
				}
			}
			else if(is_generic == true)
			{
				this.comp_name = "component" + driver_num;
			}


			this.is_generic = is_generic;

			driver_num++;
			this.type = "driver";
			this.key = key;


			this.group = myDiagram.model.findNodeDataForKey(key).group;
			this.is_agent = false;

			interface_arr(this);
			transaction_distr(this);
		}
	
		real(super_path)
		{
			//cut the templ
			var templ = driver_templ;

			var i = 0;
			while(revised_templ[i] != null)
			{
				var v_t = revised_templ[i];
				if(v_t[0] == this.comp_name)
				{
					var templ = v_t[1];
				}
				i++;
		
			}

			templ = templ.replace(/\\n/g,"changeLine");
			templ = templ.replace(/\\/\\/\\/\\//g,"fSlash");
	
			var templ1 = templ.match(/(?<=fSlashtemplate block: head_block startschangeLine).*?(?=fSlashtemplate block: head_block endschangeLine)/);
			templ1 = templ1.toString().replace(/changeLine/g,"\\n");

			var templ2 = templ.match(/(?<=fSlashtemplate block: variable_block startschangeLine).*?(?=fSlashtemplate block: variable_block endschangeLine)/);
			templ2 = templ2.toString().replace(/changeLine/g,"\\n");

			var templ3 = templ.match(/(?<=fSlashtemplate block: func_decl_block startschangeLine).*?(?=fSlashtemplate block: func_decl_block endschangeLine)/);
			templ3 = templ3.toString().replace(/changeLine/g,"\\n");

			var templ4 = templ.match(/(?<=fSlashtemplate block: new_object startschangeLine).*?(?=fSlashtemplate block: new_object endschangeLine)/);
			templ4 = templ4.toString().replace(/changeLine/g,"\\n");

			var templ5 = templ.match(/(?<=fSlashtemplate block: build_phase startschangeLine).*?(?=fSlashtemplate block: build_phase endschangeLine)/);
			templ5 = templ5.toString().replace(/changeLine/g,"\\n");

			var templ6 = templ.match(/(?<=fSlashtemplate block: main_phase startschangeLine).*?(?=fSlashtemplate block: main_phase endschangeLine)/);
			templ6 = templ6.toString().replace(/changeLine/g,"\\n");

			var templ7 = templ.match(/(?<=fSlashtemplate block: func_def_block startschangeLine).*?(?=fSlashtemplate block: func_def_block endschangeLine)/);
			templ7 = templ7.toString().replace(/changeLine/g,"\\n");
	

			//realize the model
			//generate text array
			var re_arr = [];


			re_arr = driver_real_main(this,templ1,templ2,templ3,templ4,templ5,templ6,templ7);

			//generate text
			var text = "";
			var j = 0;
			while(re_arr[j]!=null)
			{
				text = text + re_arr[j];
				j++;
			}

			
			//initialize a new file under the current path
			var file_path = super_path + "/" + this.comp_name + ".sv"
			vscode.postMessage({ command: 'NewFile', text: text, new_path: file_path });
		}
	}
	
	class monitor extends node
	{
		constructor(name,key)
		{
			super();
	
			this.name = name;
			this.comp_name = name;
			if(name == "Monitor")
			{
				this.comp_name = "monitor" + monitor_num;
			}

			monitor_num++;
			this.type = "monitor";
			this.key = key;
			this.group = myDiagram.model.findNodeDataForKey(key).group;
			this.is_agent = false;

			interface_arr(this);
			transaction_distr(this);
		}
	
		real(super_path)
		{
			//cut the templ
			var templ = monitor_templ;

			var i = 0;
			while(revised_templ[i] != null)
			{
				var v_t = revised_templ[i];
				if(v_t[0] == this.comp_name)
				{
					var templ = v_t[1];
				}
				i++;
		
			}


			templ = templ.replace(/\\n/g,"changeLine");
			templ = templ.replace(/\\/\\/\\/\\//g,"fSlash");
	
			var templ1 = templ.match(/(?<=fSlashtemplate block: head_block startschangeLine).*?(?=fSlashtemplate block: head_block endschangeLine)/);
			templ1 = templ1.toString().replace(/changeLine/g,"\\n");

			var templ2 = templ.match(/(?<=fSlashtemplate block: variable_block startschangeLine).*?(?=fSlashtemplate block: variable_block endschangeLine)/);
			templ2 = templ2.toString().replace(/changeLine/g,"\\n");

			var templ3 = templ.match(/(?<=fSlashtemplate block: func_decl_block startschangeLine).*?(?=fSlashtemplate block: func_decl_block endschangeLine)/);
			templ3 = templ3.toString().replace(/changeLine/g,"\\n");

			var templ4 = templ.match(/(?<=fSlashtemplate block: new_object startschangeLine).*?(?=fSlashtemplate block: new_object endschangeLine)/);
			templ4 = templ4.toString().replace(/changeLine/g,"\\n");

			var templ5 = templ.match(/(?<=fSlashtemplate block: build_phase startschangeLine).*?(?=fSlashtemplate block: build_phase endschangeLine)/);
			templ5 = templ5.toString().replace(/changeLine/g,"\\n");

			var templ6 = templ.match(/(?<=fSlashtemplate block: main_phase startschangeLine).*?(?=fSlashtemplate block: main_phase endschangeLine)/);
			templ6 = templ6.toString().replace(/changeLine/g,"\\n");

			var templ7 = templ.match(/(?<=fSlashtemplate block: func_def_block startschangeLine).*?(?=fSlashtemplate block: func_def_block endschangeLine)/);
			templ7 = templ7.toString().replace(/changeLine/g,"\\n");
	

			//realize the model
			//generate text array
			var re_arr = [];
			re_arr = monitor_real_main(this,templ1,templ2,templ3,templ4,templ5,templ6,templ7);
			//generate text
			var text = "";
			var j = 0;
			while(re_arr[j]!=null)
			{
				text = text + re_arr[j];
				j++;
			}

			
			//initialize a new file under the current path
			var file_path = super_path + "/" + this.comp_name + ".sv"
			vscode.postMessage({ command: 'NewFile', text: text, new_path: file_path });
		}
	}
	
	class scoreboard extends node
	{
		constructor(name,key)
		{
			super();
		
			this.name = name;
			this.comp_name = name;
			if(name == "Scoreboard")
			{
				this.comp_name = "scb" + scoreboard_num;
			}

			scoreboard_num++;
			this.type = "scoreboard";
			this.key = key;
			this.group = myDiagram.model.findNodeDataForKey(key).group;

			this.is_agent = false;

			interface_arr(this);
			transaction_distr(this);
		}
		real(super_path)
		{
			//cut the templ
			var templ = scoreboard_templ;

			var i = 0;
			while(revised_templ[i] != null)
			{
				var v_t = revised_templ[i];
				if(v_t[0] == this.comp_name)
				{
					var templ = v_t[1];
				}
				i++;
		
			}

			templ = templ.replace(/\\n/g,"changeLine");
			templ = templ.replace(/\\/\\/\\/\\//g,"fSlash");
	
			var templ1 = templ.match(/(?<=fSlashtemplate block: head_block startschangeLine).*?(?=fSlashtemplate block: head_block endschangeLine)/);
			templ1 = templ1.toString().replace(/changeLine/g,"\\n");

			var templ2 = templ.match(/(?<=fSlashtemplate block: variable_block startschangeLine).*?(?=fSlashtemplate block: variable_block endschangeLine)/);
			templ2 = templ2.toString().replace(/changeLine/g,"\\n");

			var templ3 = templ.match(/(?<=fSlashtemplate block: func_decl_block startschangeLine).*?(?=fSlashtemplate block: func_decl_block endschangeLine)/);
			templ3 = templ3.toString().replace(/changeLine/g,"\\n");

			var templ4 = templ.match(/(?<=fSlashtemplate block: new_object startschangeLine).*?(?=fSlashtemplate block: new_object endschangeLine)/);
			templ4 = templ4.toString().replace(/changeLine/g,"\\n");

			var templ5 = templ.match(/(?<=fSlashtemplate block: build_phase startschangeLine).*?(?=fSlashtemplate block: build_phase endschangeLine)/);
			templ5 = templ5.toString().replace(/changeLine/g,"\\n");

			var templ6 = templ.match(/(?<=fSlashtemplate block: main_phase startschangeLine).*?(?=fSlashtemplate block: main_phase endschangeLine)/);
			templ6 = templ6.toString().replace(/changeLine/g,"\\n");

			var templ7 = templ.match(/(?<=fSlashtemplate block: func_def_block startschangeLine).*?(?=fSlashtemplate block: func_def_block endschangeLine)/);
			templ7 = templ7.toString().replace(/changeLine/g,"\\n");
	

			//realize the model
			//generate text array
			var re_arr = [];
			re_arr = scoreboard_real_main(this,templ1,templ2,templ3,templ4,templ5,templ6,templ7);

			//generate text
			var text = "";
			var j = 0;
			while(re_arr[j]!=null)
			{
				text = text + re_arr[j];
				j++;
			}

			
			//initialize a new file under the current path
			var file_path = super_path + "/" + this.comp_name + ".sv"
			vscode.postMessage({ command: 'NewFile', text: text, new_path: file_path });
		}
	}
	
	
	
	class sequencer extends node
	{
		constructor(name,key)
		{
			super();
		
			this.name = name;
			this.comp_name = name;
			this.transaction = "uNdefined";

			if(name == "Sequencer")
			{
				this.comp_name = "sequencer" + scoreboard_num;
			}

			sequencer_num++;
			this.type = "sequencer";
			this.key = key;
			this.group = myDiagram.model.findNodeDataForKey(key).group;
			this.is_agent = false;

			interface_arr(this);
			transaction_distr(this);
		}
	
		real(super_path)
		{
			//cut the templ
			var templ = sequencer_templ;

			var i = 0;
			while(revised_templ[i] != null)
			{
				var v_t = revised_templ[i];
				if(v_t[0] == this.comp_name)
				{
					var templ = v_t[1];
				}
				i++;
		
			}

			templ = templ.replace(/\\n/g,"changeLine");
			templ = templ.replace(/\\/\\/\\/\\//g,"fSlash");
	
			var templ1 = templ.match(/(?<=fSlashtemplate block: head_block startschangeLine).*?(?=fSlashtemplate block: head_block endschangeLine)/);
			templ1 = templ1.toString().replace(/changeLine/g,"\\n");

			var templ2 = templ.match(/(?<=fSlashtemplate block: variable_block startschangeLine).*?(?=fSlashtemplate block: variable_block endschangeLine)/);
			templ2 = templ2.toString().replace(/changeLine/g,"\\n");

			var templ3 = templ.match(/(?<=fSlashtemplate block: func_decl_block startschangeLine).*?(?=fSlashtemplate block: func_decl_block endschangeLine)/);
			templ3 = templ3.toString().replace(/changeLine/g,"\\n");

			var templ4 = templ.match(/(?<=fSlashtemplate block: func_def_block startschangeLine).*?(?=fSlashtemplate block: func_def_block endschangeLine)/);
			templ4 = templ4.toString().replace(/changeLine/g,"\\n");
	

			//realize the model
			//generate text array
			var re_arr = [];
			re_arr = sequencer_real_main(this,templ1,templ2,templ3,templ4);

			//generate text
			var text = "";
			var j = 0;
			while(re_arr[j]!=null)
			{
				text = text + re_arr[j];
				j++;
			}

			
			//initialize a new file under the current path
			var file_path = super_path + "/" + this.comp_name + ".sv"
			vscode.postMessage({ command: 'NewFile', text: text, new_path: file_path });
		}
	}
	

	class model extends node
	{
		constructor(name,key)
		{
			super();
	
			this.name = name;
			this.comp_name = name;
			if(name == "Reference Model")
			{
				this.comp_name = "rm";
			}

			model_num++;
			this.type = "model";
			this.key = key;
			this.group = myDiagram.model.findNodeDataForKey(key).group;

			this.is_agent = false;

			interface_arr(this);
			transaction_distr(this);
		}
	

		// realization of a reference model
		// initialize a new folder under the given superior folder path
		// call realization function of all inside nodes

		real(super_path)		//different than browser version
		{
			//cut the templ
			var templ = model_templ;

			var i = 0;
			while(revised_templ[i] != null)
			{
				var v_t = revised_templ[i];
				if(v_t[0] == this.comp_name)
				{
					var templ = v_t[1];
				}
				i++;
		
			}


			templ = templ.replace(/\\n/g,"changeLine");
			templ = templ.replace(/\\/\\/\\/\\//g,"fSlash");
	
			var templ1 = templ.match(/(?<=fSlashtemplate block: head_block startschangeLine).*?(?=fSlashtemplate block: head_block endschangeLine)/);
			templ1 = templ1.toString().replace(/changeLine/g,"\\n");

			var templ2 = templ.match(/(?<=fSlashtemplate block: variable_block startschangeLine).*?(?=fSlashtemplate block: variable_block endschangeLine)/);
			templ2 = templ2.toString().replace(/changeLine/g,"\\n");

			var templ3 = templ.match(/(?<=fSlashtemplate block: func_decl_block startschangeLine).*?(?=fSlashtemplate block: func_decl_block endschangeLine)/);
			templ3 = templ3.toString().replace(/changeLine/g,"\\n");

			var templ4 = templ.match(/(?<=fSlashtemplate block: new_object startschangeLine).*?(?=fSlashtemplate block: new_object endschangeLine)/);
			templ4 = templ4.toString().replace(/changeLine/g,"\\n");

			var templ5 = templ.match(/(?<=fSlashtemplate block: build_phase startschangeLine).*?(?=fSlashtemplate block: build_phase endschangeLine)/);
			templ5 = templ5.toString().replace(/changeLine/g,"\\n");

			var templ6 = templ.match(/(?<=fSlashtemplate block: main_phase startschangeLine).*?(?=fSlashtemplate block: main_phase endschangeLine)/);
			templ6 = templ6.toString().replace(/changeLine/g,"\\n");

			var templ7 = templ.match(/(?<=fSlashtemplate block: func_def_block startschangeLine).*?(?=fSlashtemplate block: func_def_block endschangeLine)/);
			templ7 = templ7.toString().replace(/changeLine/g,"\\n");
	

			//realize the model
			//generate text array
			var re_arr = [];
			re_arr = reference_model_real_main(this,templ1,templ2,templ3,templ4,templ5,templ6,templ7);	
			//generate text
			var text = "";
			var j = 0;
			while(re_arr[j]!=null)
			{
				text = text + re_arr[j];
				j++;
			}

			
			//initialize a new file under the current path
			var file_path = super_path + "/" + this.comp_name + ".sv"
			vscode.postMessage({ command: 'NewFile', text: text, new_path: file_path });
			
		}
	}

	
	
	class agent extends node
	{
		constructor(name,key,is_generic)
		{
			super();
	
			this.name = name;
			this.comp_name = name;
			if(name == "Agent")
			{
				this.comp_name = "agent" + agent_num;
			}
			else
			{
				this.comp_name = name;
			}

			agent_num++;
			this.type = "agent";
			this.is_generic = is_generic;
			this.key = key;
	
			if(myDiagram.model.findNodeDataForKey(key).group!=null)
			{
				this.group = myDiagram.model.findNodeDataForKey(key).group;
			}
			else
			{
				this.group = "uNdefined";
			}

			this.is_agent = true;
	
			this.contain = [];
		
			var i = 0;
			while(myDiagram.model.nodeDataArray[i]!=null)
			{
				if(myDiagram.model.nodeDataArray[i].group==this.key)
				{
					this.contain.push(myDiagram.model.nodeDataArray[i].key);
		
				}
				i++;
			}  
	
		}
	

		// realization of an agent
		// initialize a new folder under the given superior folder path
		// call realization function of all inside nodes

		real(super_path)		//different than browser version
		{	
			//initialize a new folder under superior path
			var cur_path = super_path + "/" + this.comp_name;
			vscode.postMessage({ command: 'NewFolder', text: '', new_path: cur_path });

			
			//figure out which nodes are inside
			this.contain_nodes();


			//call real function of all inside nodes with current path
			var sub_connects = [];
			var i = 0;
			while(this.contain[i]!=null)
			{

				if(this.contain[i].type == "agent")
				{
					var temp = this.contain[i].real(cur_path);
					sub_connects.push(temp);
				}

				else
				{
					this.contain[i].real(cur_path);
				}

				i++;
			}


			//reform the subconnect array
			if(sub_connects[0] != null)
			{
				var temp_arr = sub_connects[0];

				var i = 1;
				while(sub_connects[i] != null)
				{
					var temp_arr1 = sub_connects[i];
					var j = 0;
					while(temp_arr1[j] != null)
					{
						temp_arr.push(temp_arr1[j]);
						j++;
					}

					i++;	
				}
				sub_connects = temp_arr;

			}


			//set connections array of this agent
			this.connect(sub_connects);




			//before realization cut the templ
			var templ = agent_templ;

			var i = 0;
			while(revised_templ[i] != null)
			{
				var v_t = revised_templ[i];
				if(v_t[0] == this.comp_name)
				{
					var templ = v_t[1];
				}
				i++;
		
			}

			templ = templ.replace(/\\n/g,"changeLine");
			templ = templ.replace(/\\/\\/\\/\\//g,"fSlash");

	
			var templ1 = templ.match(/(?<=fSlashtemplate block: head_block startschangeLine).*?(?=fSlashtemplate block: head_block endschangeLine)/);
			templ1 = templ1.toString().replace(/changeLine/g,"\\n");

			var templ2 = templ.match(/(?<=fSlashtemplate block: variable_block startschangeLine).*?(?=fSlashtemplate block: variable_block endschangeLine)/);
			templ2 = templ2.toString().replace(/changeLine/g,"\\n");

			var templ3 = templ.match(/(?<=fSlashtemplate block: func_decl_block startschangeLine).*?(?=fSlashtemplate block: func_decl_block endschangeLine)/);
			templ3 = templ3.toString().replace(/changeLine/g,"\\n");

			var templ4 = templ.match(/(?<=fSlashtemplate block: new_object startschangeLine).*?(?=fSlashtemplate block: new_object endschangeLine)/);
			templ4 = templ4.toString().replace(/changeLine/g,"\\n");

			var templ5 = templ.match(/(?<=fSlashtemplate block: build_phase startschangeLine).*?(?=fSlashtemplate block: build_phase endschangeLine)/);
			templ5 = templ5.toString().replace(/changeLine/g,"\\n");

			var templ6 = templ.match(/(?<=fSlashtemplate block: func_def_block startschangeLine).*?(?=fSlashtemplate block: func_def_block endschangeLine)/);
			templ6 = templ6.toString().replace(/changeLine/g,"\\n");

	

			//realize the agent
			//generate text array
			var re_arr = [];
			re_arr = agent_real_main(this,templ1,templ2,templ3,templ4,templ5,templ6);
			//generate text
			var text = "";
			var j = 0;
			while(re_arr[j]!=null)
			{
				text = text + re_arr[j];
				j++;
			}

			
			//initialize a new file under the current path
			var file_path = cur_path + "/" + this.comp_name + ".sv"
			vscode.postMessage({ command: 'NewFile', text: text, new_path: file_path });

			return this.remain_connects;

		}
	

		contain_nodes()
		{
			this.contain = [];
			var i = 0;
			while(nodesArray[i]!=null)
			{
				if(nodesArray[i].group==this.key)
				{
					this.contain.push(nodesArray[i]);
				}
	
				i++;
			}
		}
	
		point_to_ports()
		{
			var re_arr = [];
			re_arr = point_to_ports_real(this);
			return re_arr;
	
		}


		connect(sub_connects)
		{
			var sub_flag = false;
			if(sub_connects == null)
			{
				var sub_connects = [];

				if(sub_connects[0] == null)
				{
					sub_flag = true;
				}
			}


			//form an array of the info of all ports inside this agent
			//note that this array excludes all ports inside agents that
			//are inside this agent
			var i = 0;
			while(linksArray[i] != null)
			{

				var f_in = is_inside(linksArray[i].from_node,this);
				var t_in = is_inside(linksArray[i].to_node,this);
				if(f_in == true && t_in == false)
				{
					var sc = [];
					sc.push(linksArray[i]);
					sc.push(linksArray[i].fromPort);
					sc.push(linksArray[i].from_node.comp_name)
					sc.push(linksArray[i].toPort);
					sc.push(linksArray[i].to_node.comp_name)
					sc.push(1);
		
					sub_connects.push(sc);
				}

				if(f_in == false && t_in == true)
				{
					var sc = [];
					sc.push(linksArray[i]);
					sc.push(linksArray[i].fromPort);
					sc.push(linksArray[i].from_node.comp_name);
					sc.push(linksArray[i].toPort);
					sc.push(linksArray[i].to_node.comp_name);
					sc.push(1);

					sub_connects.push(sc);
				}


				i++;
			}



			this.connections = [];

			this.remain_connects = [];

			if(sub_flag == false)
			{
				//compare each element of subject connects with each other 
				//to see if there are ports connected and needed to be 
				//declared in the connect_phase of this agent
				var i = 0;
				while(sub_connects[i] != null)
				{
					var sc_1 = sub_connects[i];

					var t_flag = false; 
					var j = 0;
					while(sub_connects[j] != null)
					{
						var sc_2 = sub_connects[j];

						if(sc_1[0] == sc_2[0])
						{
							var sc_f_in = is_inside_recur(sc_1[0].from_node,this);
							var sc_t_in = is_inside_recur(sc_1[0].to_node,this);


							if(sc_f_in == true && sc_t_in == true && sc_1[5] == 1 && sc_2[5] == 1)
							{
								this.connections.push(sc_1);
								t_flag = true;
						
							}

						}
						j++;

					}

					if(t_flag == false)
					{
						this.remain_connects.push(sc_1);
					}


					i++;
				}

			}

			if(sub_flag == true)
			{
				var i = 0;
				while(sub_connects[i] != null)
				{
					this.remain_connects.push(sub_connects[i]);
					i++;
				}
			}


			//sort the connection array
			var counter = 0;
			var i = 0;
			while(this.connections[i] != null)
			{
				var t1 = this.connections[i]
				var j = 0;
				while(this.connections[j] != null)
				{
					var t2 = this.connections[j];
					if(t1[0] == t2[0])
					{
						counter++;
					}
					j++;
				}

				if(counter > 1)
				{
					this.connections.splice(i,counter-1)
				}

				i++;
				counter = 0;
			}


		}


	
	}
	
	function point_to_ports_real(agent)
	{
		//initialize an array to mark each "pointed to" port in the agent's port array
		var mark_arr = [];
	
		//traverse the ports array for the agent
		//traverse the links array to find each link pertaining to each port
		//determine if the port is the end of a "point to" link
		var i = 0;
		while(agent.ports[i]!=null)
		{
			var j = 0;
			while(linksArray[j]!=null)
			{
				if(linksArray[j].from_node == agent)
				{
					if(linksArray[j].fromPort == agent.ports[i].portId)
					{
						console.log("now is ports[" + i + "]: " + agent.ports[i].portId);
	
						if(linksArray[j].type == "point to")
						{
							console.log("now is linksArray[" + j + "]\\n" + "from_node: " + linksArray[j].from_node + "\\n");
							//now this link is "point to"
							//mark the corresponding index in the mark array & document the "pointing to" inside node
							//each item of mark array is a tuple implemented by an array with 1st item being inside node & 2nd item being pid
							var temp = [];
							temp[0] = linksArray[j].to_node;
							temp[1] = linksArray[j].toPort;
							mark_arr[i] = temp;
							
						}
					}
				}
				j++;
			}
			i++;
		}
	
		return mark_arr;    
	}

	function is_inside(node,env)
	{
		env.contain_nodes();

		var is_o = false;
		var i = 0;
		while(env.contain[i] != null)
		{
			if(env.contain[i] == node)
			{
				is_o = true;
			}
			i++;
		}

		return is_o;

	}

	function is_inside_recur(node,env)
	{

		env.contain_nodes();

		var i = 0;
		while(env.contain[i] != null)
		{

			if(env.contain[i] == node)
			{
				return true;
			}
			else if(env.contain[i].type == "agent")
			{
				if (is_inside_recur(node,env.contain[i])){
					//vscode.postMessage({ command: 'alert', text: "check pass" + env.name });
					return true;
				}
			}

			i++;
		}


		return false;

	}

	

	class env extends node
	{
		constructor(name,key)
		{
			super();
			this.name = name;
			this.key = key;
			this.type = "Env";

			this.group = "uNdefined";
			if(myDiagram.model.findNodeDataForKey(key).group != "uNdefined")
			{
				this.group = myDiagram.model.findNodeDataForKey(key).group;
			}

			this.comp_name = name;
			this.is_agent = true;

			if(this.group == "Original")
			{
				if(name == "Env")
				{
					this.comp_name = "environment";
				}
			}

		}
	
		// realization of the environment
		// initialize a new folder
		// call realization function of all inside nodes
		real(super_path)		//different than browser version	
		{
			//initialize a new folder
			//define the current where folder should be initialized
			var cur_path = super_path + "/" + this.comp_name;
			vscode.postMessage({ command: 'NewFolder', text: '', new_path: cur_path });
			

			//call real function of all object nodes
			this.contain_nodes();

			var sub_connects = [];
			var i = 0;
			while(this.contain[i]!=null)
			{

				if(this.contain[i].type == "agent" || "Env")
				{
					var temp = this.contain[i].real(cur_path);
					sub_connects.push(temp);
				}

				else
				{
					this.contain[i].real(cur_path);
				}
				i++;
			}



			//reform the subconnect array
			if(sub_connects[0] != null)
			{
				var temp_arr = sub_connects[0];

				var i = 1;
				while(sub_connects[i] != null)
				{
					var temp_arr1 = sub_connects[i];
					var j = 0;
					while(temp_arr1[j] != null)
					{
						temp_arr.push(temp_arr1[j]);
						j++;
					}

					i++;	
				}
				sub_connects = temp_arr;

			}


			//set connections array of this agent
			this.connect(sub_connects);






			
			//realize the env
			//cut the templ
			var templ = env_templ;

			var i = 0;
			while(revised_templ[i] != null)
			{
				var v_t = revised_templ[i];
				if(v_t[0] == this.comp_name)
				{
					var templ = v_t[1];
				}
				i++;
		
			}


			templ = templ.replace(/\\n/g,"changeLine");
			templ = templ.replace(/\\/\\/\\/\\//g,"fSlash");
	
			var templ1 = templ.match(/(?<=fSlashtemplate block: head_block startschangeLine).*?(?=fSlashtemplate block: head_block endschangeLine)/);
			templ1 = templ1.toString().replace(/changeLine/g,"\\n");

			var templ2 = templ.match(/(?<=fSlashtemplate block: variable_block startschangeLine).*?(?=fSlashtemplate block: variable_block endschangeLine)/);
			templ2 = templ2.toString().replace(/changeLine/g,"\\n");

			var templ3 = templ.match(/(?<=fSlashtemplate block: func_decl_block startschangeLine).*?(?=fSlashtemplate block: func_decl_block endschangeLine)/);
			templ3 = templ3.toString().replace(/changeLine/g,"\\n");

			var templ4 = templ.match(/(?<=fSlashtemplate block: new_object startschangeLine).*?(?=fSlashtemplate block: new_object endschangeLine)/);
			templ4 = templ4.toString().replace(/changeLine/g,"\\n");

			var templ5 = templ.match(/(?<=fSlashtemplate block: build_phase startschangeLine).*?(?=fSlashtemplate block: build_phase endschangeLine)/);
			templ5 = templ5.toString().replace(/changeLine/g,"\\n");

			var templ6 = templ.match(/(?<=fSlashtemplate block: func_def_block startschangeLine).*?(?=fSlashtemplate block: func_def_block endschangeLine)/);
			templ6 = templ6.toString().replace(/changeLine/g,"\\n");
	



			//generate text array
			var re_arr = [];
			re_arr = env_real_main(this,templ1,templ2,templ3,templ4,templ5,templ6);

			//generate text
			var text = "";
			var j = 0;
			while(re_arr[j]!=null)
			{
				text = text + re_arr[j];
				j++;
			}
	
			//initialize a new file
			var file_path = cur_path + "/" + this.comp_name + ".sv";
			vscode.postMessage({ command: 'NewFile', text: text, new_path: file_path });


			if(this.group != "Original")
			{
				return
			}

			//realization of interfaces
			//initialize a new folder
			var cur_path = super_path + "/" + "interfaces";
			vscode.postMessage({ command: 'NewFolder', text: '', new_path: cur_path });

			//initialize new files
			var i = 0;
			while(myDiagram.model.nodeDataArray[i]!=null)
			{
				if(myDiagram.model.nodeDataArray[i].topArray[0] != null)
				{
					if(myDiagram.model.nodeDataArray[i].topArray[0].portId == "instantiate")
					{
						// var interface_text = '\`include "uvm_macros.svh" \\n' + 'import uvm_pkg::*;  \\n\\n'
						// 				+ "interface " + myDiagram.model.nodeDataArray[i].name + "(input logic rxc, input logic txc); \\n" 
						// 				+ "//Please define this interface here\\n\\n\\n\\n" + "endinterface // if";

						var interface_text = interface_real(myDiagram.model.nodeDataArray[i].name);


						var file_path = cur_path + "/" + myDiagram.model.nodeDataArray[i].name + ".sv";
						vscode.postMessage({ command: 'NewFile', text:interface_text , new_path: file_path });
					}
				}
				i++;
			}


			//realization of transaction
			//initialize a new folder
			var cur_path = super_path + "/" +  "transactions";
			vscode.postMessage({ command: 'NewFolder', text: '', new_path: cur_path });

			//initialize new files
			var i = 0;
			while(myDiagram.model.nodeDataArray[i]!=null)
			{
				if(myDiagram.model.nodeDataArray[i].topArray[0] != null)
				{
					if(myDiagram.model.nodeDataArray[i].topArray[0].portId == "transaction specific")
					{
						// var transaction_text = '\`include "uvm_macros.svh" \\n' + 'import uvm_pkg::*;  \\n' + "class " + myDiagram.model.nodeDataArray[i].name 
						// 			+ " extends uvm_sequence_item ;  \\n"
						// 			+ "//Please define this transaction here \\n\\n\\n\\n"
						// 			+ "endclass // m_transaction  \\n\\n" + 'function ' + myDiagram.model.nodeDataArray[i].name + '::new(string name = "' + myDiagram.model.nodeDataArray[i].name  + '"); \\n'
						// 			+ "   super.new(name);\\n" + "endfunction";

						var transaction_text = transaction_real(myDiagram.model.nodeDataArray[i].name);

						var file_path = cur_path + "/" + myDiagram.model.nodeDataArray[i].name + ".sv";
						vscode.postMessage({ command: 'NewFile', text: transaction_text, new_path: file_path });
					}
				}
				i++;
			}


			var top_text = top_real();
			vscode.postMessage({ command: 'NewFile', text: top_text, new_path: super_path + "/" + 'top.sv' });



			return this.remain_connects;

		}


		contain_nodes()
		{
			this.contain = [];
			var i = 0;
			while(nodesArray[i]!=null)
			{
				if(nodesArray[i].group==this.key)
				{
					this.contain.push(nodesArray[i]);
				}
	
				i++;
			}
		}






		

		connect(sub_connects)
		{
			var sub_flag = false;
			if(sub_connects == null)
			{
				var sub_connects = [];

				if(sub_connects[0] == null)
				{
					sub_flag = true;
				}
			}


			//form an array of the info of all ports inside this agent
			//note that this array excludes all ports inside agents that
			//are inside this agent
			var i = 0;
			while(linksArray[i] != null)
			{

				var f_in = is_inside(linksArray[i].from_node,this);
				var t_in = is_inside(linksArray[i].to_node,this);
				if(f_in == true && t_in == false)
				{
					var sc = [];
					sc.push(linksArray[i]);
					sc.push(linksArray[i].fromPort);
					sc.push(linksArray[i].from_node.comp_name)
					sc.push(linksArray[i].toPort);
					sc.push(linksArray[i].to_node.comp_name)
					sc.push(1);
		
					sub_connects.push(sc);
				}

				if(f_in == false && t_in == true)
				{
					var sc = [];
					sc.push(linksArray[i]);
					sc.push(linksArray[i].fromPort);
					sc.push(linksArray[i].from_node.comp_name);
					sc.push(linksArray[i].toPort);
					sc.push(linksArray[i].to_node.comp_name);
					sc.push(1);

					sub_connects.push(sc);
				}


				i++;
			}



			this.connections = [];

			this.remain_connects = [];

			if(sub_flag == false)
			{
				//compare each element of subject connects with each other 
				//to see if there are ports connected and needed to be 
				//declared in the connect_phase of this agent
				var i = 0;
				while(sub_connects[i] != null)
				{
					var sc_1 = sub_connects[i];

					var t_flag = false; 
					var j = 0;
					while(sub_connects[j] != null)
					{
						var sc_2 = sub_connects[j];

						if(sc_1[0] == sc_2[0])
						{
							var sc_f_in = is_inside_recur(sc_1[0].from_node,this);
							var sc_t_in = is_inside_recur(sc_1[0].to_node,this);


							if(sc_f_in == true && sc_t_in == true && sc_1[5] == 1 && sc_2[5] == 1)
							{
								this.connections.push(sc_1);
								t_flag = true;
						
							}

						}
						j++;

					}

					if(t_flag == false)
					{
						this.remain_connects.push(sc_1);
					}


					i++;
				}

			}

			if(sub_flag == true)
			{
				var i = 0;
				while(sub_connects[i] != null)
				{
					this.remain_connects.push(sub_connects[i]);
					i++;
				}
			}


			//sort the connection array
			var counter = 0;
			var i = 0;
			while(this.connections[i] != null)
			{
				var t1 = this.connections[i]
				var j = 0;
				while(this.connections[j] != null)
				{
					var t2 = this.connections[j];
					if(t1[0] == t2[0])
					{
						counter++;
					}
					j++;
				}

				if(counter > 1)
				{
					this.connections.splice(i,counter-1)
				}

				i++;
				counter = 0;
			}


		}



















	
	}


	// Function: convert the interface array of the node into a member of the object
	function interface_arr(node)
	{
		if(myDiagram.model.findNodeDataForKey(node.key).adArray[0] == null)
		{
			return;
		}

		node.interface = [];

		var i = 0;
		while(myDiagram.model.findNodeDataForKey(node.key).adArray[i]!=null)
		{
			node.interface[i] = myDiagram.model.findNodeDataForKey(node.key).adArray[i].portIf;
			i++;
		}		
	}
	

	// Function: convert the transaction array of the node into a member of the object
	function transaction_distr(node)
	{
		if(myDiagram.model.findNodeDataForKey(node.key).trArray[0] == null)
		{
			return;
		}

		node.transaction = myDiagram.model.findNodeDataForKey(node.key).trArray[0].portId;
	}


	
	
	class link
	{
		constructor(type,from,to,fromPort,toPort,trans)
		{
			this.type = type;
			this.from = from;
			this.to = to;
			this.fromPort = fromPort;
			this.toPort = toPort;
			this.trans = trans;
			if(trans == undefined)
			{
				this.trans = "uNdefined";
			}
	
		}
	
		re2class()
		{
			var i = 0;
			while(nodesArray[i]!=null)
			{
				var j = 0;
				while(nodesArray[i].links_as_from[j]!=null)
				{
					if(nodesArray[i].links_as_from[j]==this)
					{
						this.from_node = nodesArray[i];
					}
					j++;
				}
	
				var j = 0;
				while(nodesArray[i].links_as_to[j]!=null)
				{
					if(nodesArray[i].links_as_to[j]==this)
					{
						this.to_node = nodesArray[i];
					}
					j++;
				}
				i++;
			}
	
			if(this.from_node!=null&&this.to_node!=null)
			{
				this.fifo_name = this.from_node.comp_name + "_" + this.to_node.comp_name + "_fifo";
			}
		}
	
	}
	
	
	//initialize nodesArray for all nodes' data in GoJS diagram for the synthesis of sv codes
	//the data contained by created objects cannot be used to access their GoJS counterparts
	//create objects according to nodeDataArray's items
	//different items are translated into different derived classes
	//access nodeDataArray one by one to create objects with diversified types
	function nodes2objects()
	{
		//initialize nodesArray
		nodesArray = [];
	
		var t_len = 0;
		while(myDiagram.model.nodeDataArray[t_len] != null)
		{
			t_len++;
		}

		//traverse the nodeDataArray
		for(var x = 0; x < t_len; x++)
		{
			var i = x + 1;
			nodeData = myDiagram.model.nodeDataArray[x];

			if(nodeData != null){
			
			//type of each node is determined by type in diagram
			if(nodeData.type=="Env")
			{
				nodesArray[i-1] = new env(nodeData.name,nodeData.key);
			}
	
			else if(nodeData.type=="Driver")
			{
				nodesArray[i-1] = new driver(nodeData.name,nodeData.key,false);
			}
			else if(nodeData.type=="Monitor")
			{
				nodesArray[i-1] = new monitor(nodeData.name,nodeData.key);
			}
	
			else if(nodeData.type=="Sequencer")
			{
				nodesArray[i-1] = new sequencer(nodeData.name,nodeData.key);
			}
	
			else if(nodeData.type=="agent")
			{
				nodesArray[i-1] = new agent(nodeData.name,nodeData.key,false);
			}
	
			else if(nodeData.type=="Reference Model")
			{
				nodesArray[i-1] = new model(nodeData.name,nodeData.key);
			}
	
			else if(nodeData.type=="Scoreboard")
			{
				nodesArray[i-1] = new scoreboard(nodeData.name,nodeData.key);
			}

			else if(nodeData.type=="Generic Component")
			{
				nodesArray[i-1] = new driver(nodeData.name,nodeData.key,true);
			}

			else if(nodeData.type=="Generic Agent")
			{
				nodesArray[i-1] = new agent(nodeData.name,nodeData.key,true);
			}

			else if(nodeData.type=="Env")
			{
				nodesArray[i-1] = new env(nodeData.name,nodeData.key,true);
			}
	
			else     
			{
				nodesArray[i-1] = new node(nodeData.name,nodeData.key);
			}
	
			//initialize links_as arrays & ports arrays to contain all link objects and ports pertaining to each node
			nodesArray[i-1].links_as_from = [];
			nodesArray[i-1].links_as_to = [];
			nodesArray[i-1].ports = [];

	
			var j = 0;			
			var k = 0;
			var l = 0;
			var m = 0;
			//traverse the linksArray
			while(linksArray[j]!=null)
			{ 
				if(linksArray[j].fromPort != "instantiate")
				{
					if(linksArray[j].from==nodeData.key)
					{
						//enlist the matched link
						nodesArray[i-1].links_as_from[k] = linksArray[j];
						k++;
		
						var t_arr = [];
						t_arr = determine_port(linksArray[j].fromPort,nodeData.key);
						side = t_arr[1];
						index = t_arr[0];

		
						//initialize a "already" flag to check if the port has been enlisted before
						already = false;
						if(nodesArray[i-1].ports != null)
						{
							var h = 0;
							while(nodesArray[i-1].ports[h] != null)
							{
								if(nodesArray[i-1].ports[h].portId == linksArray[j].fromPort)
								{
									already = true;
								}
								h++;
							}
						}
		
						//enlist the matched port
						//here the port is an item in a node's sideArray contains: portType, portColor, portId
						if(already == false)
						{
							if(side=="left")
							{
								nodesArray[i-1].ports[m] = myDiagram.model.findNodeDataForKey(nodeData.key).leftArray[index];
							}
							if(side=="right")
							{
								nodesArray[i-1].ports[m] = myDiagram.model.findNodeDataForKey(nodeData.key).rightArray[index];
							}
							if(side=="top")
							{
								nodesArray[i-1].ports[m] = myDiagram.model.findNodeDataForKey(nodeData.key).topArray[index];
							}
							if(side=="bottom")
							{
								nodesArray[i-1].ports[m] = myDiagram.model.findNodeDataForKey(nodeData.key).bottomArray[index];
							}
		
							m++;
						}
					}      
					
		
					if(linksArray[j].to==nodeData.key)
					{
						nodesArray[i-1].links_as_to[l] = linksArray[j];
						l++;
		
						var t_arr = [];
						t_arr = determine_port(linksArray[j].toPort,nodeData.key);
						side = t_arr[1];
						index = t_arr[0];

		
						//check if the port has been enlisted before
						already = false;
						if(nodesArray[i-1].ports != null)
						{
							var h = 0;
							while(nodesArray[i-1].ports[h] != null)
							{
								if(nodesArray[i-1].ports[h].portId == linksArray[j].toPort)
								{
									already = true;
								}
								h++;
							}
						}
		
						if(already == false)
						{
							if(side=="left")
							{
								nodesArray[i-1].ports[m] = myDiagram.model.findNodeDataForKey(nodeData.key).leftArray[index];
							}
							if(side=="right")
							{
								nodesArray[i-1].ports[m] = myDiagram.model.findNodeDataForKey(nodeData.key).rightArray[index];
							}
							if(side=="top")
							{
								nodesArray[i-1].ports[m] = myDiagram.model.findNodeDataForKey(nodeData.key).topArray[index];
							}
							if(side=="bottom")
							{
								nodesArray[i-1].ports[m] = myDiagram.model.findNodeDataForKey(nodeData.key).bottomArray[index];
							}
		
							m++;
						}
		
					}
			
				}

				j++;

				
			}/////////while

		}//not

	}//for


	}
	
	
	function links2objects()
	{
		linksArray = [];
		 //determine max index LinkDatarray
		 var i = 0;
		 while(myDiagram.model.linkDataArray[i]!=null)
		 {
			 linkData = myDiagram.model.linkDataArray[i];
			 linksArray[i] = new link(linkData.name,linkData.from,linkData.to,linkData.fromPort,linkData.toPort,linkData.trans);
			 i++;
		 }    
	}
	
	
	function all2objects()
	{
		links2objects();

		nodes2objects();

		var i = 0;
		while(linksArray[i]!=null)
		{
			linksArray[i].re2class();
			i++;
		}
	}
	
	
	//**********************************************************************************************************
	

	// Function: agent realization
	// Returns the realization array of the given agent
	function agent_real_main(agent,templ1,templ2,templ3,templ4,templ5,templ6)
	{	
		agent_arr = [];
		agent_arr.pop();


		agent_arr.push("////template block: head_block starts" + "\\n");
		agent_arr.push(templ1);
		agent_arr.push("////template block: head_block ends" + "\\n\\n");	
		
	
		//calls the contain_nodes function to generate contain array of the given agent
		agent.contain_nodes();
	

		if(agent.is_generic == false)
		{
			p_r = agent_arr.push("class " + agent.comp_name + " extends uvm_agent ;" + "\\n");
		}
		else if(agent.is_generic == true)
		{
			p_r = agent_arr.push("class " + agent.comp_name + " extends uvm_component ;" + "\\n");
		}

		agent_declare_objects(agent);


		agent_arr.push("////template block: variable_block starts" + "\\n");
		agent_arr.push(templ2);
		agent_arr.push("////template block: variable_block ends" + "\\n\\n");


		//calls the agent_declare_port function to push port declarations into agent_arr
		agent_declare_ports(agent);
	
	
		p_r = agent_arr.push("\\t" + "extern function new(string name, uvm_component parent);" + "\\n");
		p_r = agent_arr.push("\\t" + "extern virtual function void build_phase(uvm_phase phase);" + "\\n");
		p_r = agent_arr.push("\\t" + "extern virtual function void connect_phase(uvm_phase phase);" + "\\n");


		agent_arr.push("////template block: func_decl_block starts" + "\\n");
		agent_arr.push(templ3 + "\\n");
		agent_arr.push("////template block: func_decl_block ends" + "\\n\\n");						

	
		agent_utils(agent);

		agent_arr.push("endclass\\n");
	
		agent_arr.push("\\n");
	
		p_r = agent_arr.push("function " + agent.comp_name + "::new(string name, uvm_component parent);" + "\\n");
		p_r = agent_arr.push("\\t" + "super.new(name, parent);"+ "\\n");


		agent_arr.push("////template block: new_object starts" + "\\n");
		agent_arr.push(templ4);
		agent_arr.push("////template block: new_object ends" + "\\n");
		

		p_r = agent_arr.push("endfunction // new"+ "\\n");
		agent_arr.push("\\n");
	
		agent_build_phase(agent,templ5);
	
		agent_arr.push("\\n");
	
		agent_connect_phase(agent);


		agent_arr.push("////template block: func_def_block starts" + "\\n");
		agent_arr.push(templ6);
		agent_arr.push("////template block: func_def_block ends" + "\\n\\n");
	
		
		return agent_arr;
	
	}
	
	
	// Function: declare agent's ports
	// Push the declaration of the given agent's ports into the agent_arr
	function agent_declare_ports(agent)			
	{

		agent_arr.push("\\n");

		//traverse the agent.ports array 
		//push port declarations for each port according to the type 
		var i = 0;
		while(agent.ports[i]!=null)
		{
			if(agent.ports[i].portType=="analysis_port")
			{
				agent_arr.push("\\t" + "uvm_analysis_port#(" + agent.ports[i].portTrans + ")  " + agent.ports[i].portId + ";" + "\\n");
			}
			else if(agent.ports[i].portType=="PORT")
			{
				agent_arr.push("\\t" + "uvm_blocking_get_port#(" + agent.ports[i].portTrans + ")  " + agent.ports[i].portId + ";" + "\\n");
			}
			else if(agent.ports[i]=="IMP")
			{
				agent_arr.push("\\t" + "uvm_analysis_imp#(" + agent.ports[i].portTrans + ")  " + agent.ports[i].portId + ";" + "\\n");
			}
			i++;
		}
	
	}
	
	
	// Function: agent's utils
	// Push the declaration of the given agent's inside nodes' utils into agent_arr
	function agent_utils(agent)
	{
		agent_arr.push("\\t\`uvm_component_utils_begin(" + agent.comp_name +") \\n");
		var i = 0;
		while(agent.contain[i]!=null)
		{   
	
			agent_arr.push("\\t\\t\`" + 'uvm_field_object (' + " m_" + agent.contain[i].comp_name + ', UVM_ALL_ON )' + "\\n");
	
			i++;
		}
		agent_arr.push("\\t\`uvm_component_utils_end \\n");
	}
	
	
	// Function: declare agent's inside components
	// Push the declaration of the given agent's inside components into the agent_arr
	function agent_declare_objects(agent)
	{
		var j = 0;
		while(agent.contain[j]!=null)
		{
			
			agent_arr.push("\\t" + agent.contain[j].comp_name + "  " + "m_" +  agent.contain[j].comp_name  + ";" + "\\n");
			
			j++;
		}
	}
	

	function agent_declare_fifos(agent)
	{
		var i = 0;
		while(linksArray[i]!=null)
		{
			if(linksArray[i].type=="fifo")
			{
				var j = 0;
				while(agent.contain[j]!=null)
				{
					if(agent.contain[j]==linksArray[i].from_node)
					{
						var k = 0;
						while(agent.contain[k]!=null)
						{
							if(agent.contain[k]==linksArray[i].to_node)
							{
								agent_arr.push("\\t" + "uvm_tlm_analysis_fifo #(" + linksArray[i].trans + ") " + linksArray[i].from_node.comp_name + "_" + linksArray[i].to_node.comp_name + "_fifo" + "\\n");
	
							}
							k++;
						}
					}
					j++;
				}
			}
			i++;
		}
	}
	
	
	// Function: agent's build phase
	// Push the given agent's build phase into agent_arr
	function agent_build_phase(agent,templ5)
	{
		agent_arr.push("function void " + agent.comp_name + "::build_phase(uvm_phase phase);" + "\\n");
		agent_arr.push("\\t" + "super.build_phase(phase);" + "\\n");
		//agent_arr.push('\\t\`uvm_info(get_full_name(),$sfo.("build phase start");' + "\\n");
	
		//traverse the contain array of the agent to push inside components' declaration into agent_array
		var i = 0;
		while(agent.contain[i]!=null)
		{   
			agent_arr.push('\\tm_' + agent.contain[i].comp_name + ' = ' + agent.contain[i].comp_name + '::type_id::create("m_' + agent.contain[i].comp_name + '", this);' + "\\n");
			i++;
		}



		//traverse the linksArray to declare fifos in build phase	
		var i = 0;
		while(linksArray[i] != null)
		{
			var is_of = is_object(linksArray[i].from_node,agent);
			var is_ot = is_object(linksArray[i].to_node,agent);
			if(is_of == true && is_ot == true)
			{
				//now the link is inside the agent
				//push the fifo connection
				if(linksArray[i].type == "fifo")
				{
					agent_arr.push("\\t" + linksArray[i].from_node.comp_name + "_" + linksArray[i].to_node.comp_name + "_fifo" 
					+ ' = new("' + linksArray[i].from_node.comp_name + "_" + linksArray[i].to_node.comp_name + "_fifo" + '", this);' + "\\n");
				
				}

			}
			
			i++;
		}




		agent_arr.push('\\t\`uvm_info(get_full_name(),$sfo.("build phase end");' + "\\n");


		agent_arr.push("////template block: build_phase starts" + "\\n");
		agent_arr.push(templ5);
		agent_arr.push("////template block: build_phase ends" + "\\n\\n");

		agent_arr.push("endfunction // build_phase" + "\\n\\n");
		
	}
	
	

	function agent_connect_phase(agent)
	{
		agent_arr.push("function void " + agent.comp_name + "::connect_phase(uvm_phase phase); \\n");
		agent_arr.push("\\t" + "super.connect_phase(phase);" + "\\n");
	

		//push all fifo and send receive connections
		//as of now fifo declarations should have been pushed
		agent_arr.push("\\t//below is connection  \\n");
		var i = 0;
		while(linksArray[i] != null)
		{
			var is_of = is_object(linksArray[i].from_node,agent);
			var is_ot = is_object(linksArray[i].to_node,agent);
			if(is_of == true && is_ot == true)
			{
				//now the link is inside the agent
				//push the fifo connection
				if(linksArray[i].type == "fifo")
				{
					agent_arr.push("\\tm_" + linksArray[i].from_node.comp_name + "." + linksArray[i].fromPort
					+ ".connect" + "(" + linksArray[i].fifo_name + ".analysis_export" + ");" + "\\n");
	
					agent_arr.push("\\tm_" + linksArray[i].to_node.comp_name + "." + linksArray[i].toPort
					+ ".connect" + "(" + linksArray[i].fifo_name + ".blocking_get_export" + ");" + "\\n");
								
				}

				//push the send receive connection
				if(linksArray[i].type == "send receive")
				{
					agent_arr.push("\\tm_" + linksArray[i].from_node.comp_name + "." + linksArray[i].fromPort
					+ ".connect" + "(m_"  + linksArray[i].to_node.comp_name + "." + linksArray[i].toPort + ");" + "\\n");
								
				}

			}
			
			i++;
		}


		if(agent.connections != null)
		{			
			var i = 0;

			while(agent.connections[i] != null)
			{
				var tc = agent.connections[i];

				if(tc[0].type == "fifo")
				{
					agent_arr.push("\\tm_" + tc[0].from_node.comp_name + "." + tc[0].fromPort
					+ ".connect" + "(" + tc[0].fifo_name + ".analysis_export" + ");" + "\\n");
	
					agent_arr.push("\\tm_" + tc[0].to_node.comp_name + "." + tc[0].toPort
					+ ".connect" + "(" + tc[0].fifo_name + ".blocking_get_export" + ");" + "\\n");
				}

				//push the send receive connection
				if(tc[0].type == "send receive")
				{
					agent_arr.push("\\tm_" + tc[0].from_node.comp_name + "." + tc[0].fromPort
					+ ".connect" + "(m_"  + tc[0].to_node.comp_name + "." + tc[0].toPort + ");" + "\\n");
								
				}

				i++;
			}
		}


		//determine which ports are "point to" and get the corresponding inside nodes' ports
		mark_arr = agent.point_to_ports();
	
		//find out the size of mark array using the fact that its greatest size possible is the same as ports array
		var i = 0;
		while(agent.ports[i]!=null)
		{
			i++;
		}
		
		//traverse the mark array and push the ports connection accordingly 
		if(mark_arr!=null)
		{
			for(var j = 0; j < i+1; j++)    
			{
				if(mark_arr[j]!=null)
				{
					var in_pid = mark_arr[j][1];
					var out_pid = agent.ports[j].portId;
					var in_comp_n = mark_arr[j][0].comp_name;
					agent_arr.push("\\tthis." + out_pid + " = " + in_comp_n + "." + in_pid + "\\n");
				}   
			}
		}
	
		
		agent_arr.push("endfunction  \\n\\n");
	}
	



	//**************************************************************************************************




	function component_real_main(component)
	{
		component_arr = [];

		p_r = component_arr.push("\`" + "include uvm_macros.svh" + "\\n");
		p_r = component_arr.push("import uvm_pkg::*;" + "\\n");
		component_arr.push('class ' + "m_" + component.comp_name + ' extends uvm_component;' + " \\n");

		if(component.interface == null)
		{
			component_arr.push('   virtual default_if m_vif;' + "//this is default if" + " \\n");
		}

		else
		{
			var i = 0;
			while(component.interface[i]!=null)
			{
				component_arr.push('   virtual ' + component.interface[i] +' m_' + component.interface[i] + "; \\n");
				i++;
			}
		}
	
	
		component_declare_ports(component);
	
		component_arr.push(" \\n");
		component_arr.push("   " + 'extern function new(string name, uvm_component parent);' + " \\n");
		component_arr.push("   " + 'extern function void build_phase(uvm_phase phase);' + " \\n");
		component_arr.push("   " + 'extern virtual task main_phase(uvm_phase phase);' + " \\n");
		component_arr.push("   //Please add your tasks here" + " \\n");
		component_arr.push(" \\n");
		component_arr.push("   " + '\`uvm_component_utils(' + component.comp_name + ')' + " \\n");
	
		component_arr.push('endclass // m_component' + " \\n");
		component_arr.push(" \\n");
	
		component_arr.push("function " + component.comp_name + "::new(string name, uvm_component parent);" + " \\n" + 
		"   " + "super.new(name, parent);" + " \\n" + "endfunction // new" + " \\n");
		component_arr.push(" \\n");
	
		component_build_phase(component);
	
		component_arr.push(" \\n");
		component_arr.push("\\n//Please add your main phase and other needed tasks below \\n");

		component_main_phase(component);
	
		component_arr.push("\\n  //Please add your tasks here" + " \\n");
	
	
		return component_arr;
	
	}
	
	
	function component_declare_ports(component)
	{
		var i = 0;
	
		while(component.ports[i]!=null)
		{
			if(component.ports[i].portType=="analysis_port")
			{
				component_arr.push("   " + "uvm_analysis_port #(" + component.transaction + ")  " + component.ports[i].portId + ";" + " \\n");
			}
			else if(component.ports[i].portType=="PORT")
			{
				component_arr.push("   " + "uvm_blocking_get_port #(" + component.transaction + ")  " + component.ports[i].portId + ";" + " \\n");
			}
			else if(component.ports[i].portType=="IMP")
			{
				component_arr.push("   " + "uvm_analysis_imp #(" + component.transaction + ")  " + component.ports[i].portId + ";" + " \\n");
			}
			i++;
		}
	
	}
	
	
	function component_build_phase(component)
	{
	
		component_arr.push("function void " + component.comp_name + "::build_phase(uvm_phase phase);" + " \\n" +" super.build_phase(phase);" + " \\n");
	

		if(component.interface == null)
		{
			component_arr.push('   if(!uvm_config_db#(virtual default_if)::get(this, "", "default_if", m_vif))' + " \\n");
			component_arr.push('      \`uvm_fatal(get_full_name(), "Error in Getting interface");' + " \\n");
		}

		else
		{
			var i = 0;
			while(component.interface[i]!=null)
			{
				component_arr.push('   if(!uvm_config_db#(virtual ' + component.interface[i] +  ')::get(this, "", "' + component.interface[i] + '", m_' + component.interface[i] + '))' + " \\n");
				component_arr.push('      \`uvm_fatal(get_full_name(), "Error in Getting interface");' + " \\n");
				i++;
			}
		}

	
		var i = 0;
		while(component.ports[i]!=null)
		{
	
			component_arr.push("   " + component.ports[i].portId + "=" + 'new("' + component.ports[i].portId + '", this)' +  ";" + " \\n");
	
			i++;
		}
	
		component_arr.push('endfunction // build_phase' + " \\n");
	
	}
	
	function component_main_phase(component)
	{	
		component_arr.push("task" + " " + component.comp_name + "::main_phase(uvm_phase phase);" + " \\n");
	
		component_arr.push("\\n" + "endtask");
	
	}





	
	
	
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////
	//////////////////////////////////
	
	
	
	  </script>
	
	
	</head>
	<body onload="init()"> 
	
	
	<div id="sample">              
	
	  <span style="display: inline-block; vertical-align: top;">
		<div style="margin-left: 10px;">
		  <div id="myDiagramDiv" style="border: solid 1px black; width:1000px; height:750px;"></div>
		</div>
	
	
		Add port to selected nodes:
		<button onclick="addPort('top')">Top</button>
		<button onclick="addPort('bottom')">Bottom</button>
		<button onclick="addPort('left')">Left</button>
		<button onclick="addPort('right')">Right</button>

		<p>
		Right-click bring up a context menu that allows you to remove it or change its color.
	   </p>
	   <p>
	   The diagram also uses a custom link to allow for special routing to help parallel links avoid each other
	   using overridden <a>Link.computeEndSegmentLength</a>, <a>Link.hasCurviness</a>, and <a>Link.computeCurviness</a>
	   functions.
	   </p>
	
		<h3 style="color:pink">Please remember to specify a path ↓ for your templates before exporting : ) </h3>

	
	  </span>
	  <span style="display: inline-block; vertical-align: top;">
		Selected Part:<br/>
		<div id="myInspectorDiv" class="inspector"> </div><br/>
	  </span>
	
	
	  <div>
		<button id="SaveButton" onclick="save()">Save</button>
		<button onclick="load()">Load</button>

		<button onclick="outputRefer()">Export</button>
		<button onclick="templates()">Specify Templates Path</button>


	  </div>
	</div>
	</body>
	</html>

`;


  }



// this method is called when your extension is deactivated
export function deactivate() {}
