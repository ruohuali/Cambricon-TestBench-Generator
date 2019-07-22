<h1 align="center">Cambricon TestBench Generator</h1>
<br>
<p style="font-size:18px; font-family:arial;"><i>Cambricon TestBench Generator</i> 是一款基于vscode开发用于UVM验证平台环境生成的</p>
<p style="font-size:18px;">webview拓展，可以使用户在vscode中通过设计UI界面自动生成对应的UVM验证环境</p>
<br>


<div id="menu" style="background-color:lightblue; height:1000px;width:400px; float:left;">
<h2>UI界面</h2>
<br>
 
 <img src="https://github.com/ruohuali/Cambricon-TestBench-Generator/blob/master/Demo_snapshots/Demo_main_page.gif" align="right" width="400px" height="222px"/>
 
<p style="font-size:17px;">UI界面分为:<br>
<br>
<i style="font-size:15px;">·操作平台<br></i>
<i style="font-size:15px;">·属性查看器<br></i>
<i style="font-size:15px;">·交互按钮<br></i>
</p>
<br>
<p style="font-size:15px;"><i>操作平台 </i>允许用户对UI进行设计和调整
<p style="font-size:15px;">操作平台的基本元素为<b>Node, Group, Link, Port</b></p>
<p style="font-size:14px;">
<b>Node & Group</b><br>
通过在Group中右键并选择相应的<b>新建(uvm_...)</b>对象，<br>用户可以新建多种UVM平台的Object与Component
<br>
(在一个Group(代表Agent/Env)中新建Node/Group，表示在生成的环境中被新建的
Component/Object<br>被封装在当前Group中)<br>
通过右键点击一个Node/Agent，用户可以选择对其进行外观调整包括<b>变色，缩放</b><br>
通过可以点击其名字部分对名称进行编辑和使用常用快捷键对其进行<b>复制，粘贴，删除，剪切</b><br>
通过属性键UI会弹出当前Node的各项<b>属性</b><br>
</p>

<img src="https://github.com/ruohuali/Cambricon-TestBench-Generator/blob/master/Demo_snapshots/Demo1.PNG" align="right" width="355px" height="200px"/>


<p style="font-size:14px">
<b>Port</b>
<br>
在Node上添加<b>↑↓←→TLM Port</b>表示该Component/Object用于TLM通讯的Port，会在该Component/Object的
class定义中被declare
<br>
(注意在点击新建一个TLM Port键后会出现弹窗收取用户对于该Port的命名)<br>
在Node上添加<b>If Port</b>并用Link 与相应的Interface Node相连并右键Link选择Config If表示该Interface会在Node中例化(详细操作见Link说明)
<br>
在Node上添加<b>Tr Port</b>并用Link 与相应的Transaction Node相连并右键Link选择Config Tr表示该Transaction会在Node中配置(详细操作见Link说明)
</p>

<p style="font-size:14px">
<b>Link</b>
<br>
通过从一个Port向另一个Port拖拽可以<b>新建</b>一个Link的<b>外观</b>,
<br>
然后需要右键定义Link的<b>属性</b>
<br>
<b style="font-size:20px">·</b> 如果Link是<u>从一个Component A的TLM Port连接至另一个Component B的TLM Port</u>，则表示两者之间建立了由A到B的TLM通讯，
需要在外观新建后右键该Link选择此TLM通讯的类型然后右键选择定义<b>TLM Transaction</b>并输入一个transaction名做为该通讯的transaction
<br>
<b style="font-size:20px">·</b> 如果Link是<u>从Transaction自带的Port拖拽至Component的Tr Port</u>, 则说明要将该Transaction配置给Component，需要在新建外观后右键Link点击<b>Config Tr</b>表明Link类型
<br>
<b>·</b> 如果Link<u>是从Interface自带的Port拖拽至Component的If Port</u>, 则说明要将该Interface配置给Component，需要在新建外观后右键Link点击<b>Config If</b>表明Link类型
</p>

<br>

<p style="font-size:15px"><i>属性查看器</i>允许用户查看并定义一个Node/Link的外观属性</p>
<br>

<p style="font-size:15px"><i>交互按钮</i>分为<b>Save UI</b>, <b>Load UI</b>, <b>Export Environment</b></p>
<p style="font-size:14px"><b>Save UI</b>允许用户将当前UI保存为json文件至用户自选路径并命名</p>
<p style="font-size:14px"><b>Load UI</b>分为Load, Load & Combine, Load & Insert, Load & Merge</p>
<p style="font-size:14px">

<b style="font-size:20px">·</b> <b>Load </b>键会用指定UI文件覆盖当前UI
<br>
<b style="font-size:20px">·</b> <b>Load & Combine </b>键会将当前UI与指定UI文件一起放入一个Combined_Env Group
<br>
<b>·</b> <b>Load & Merge </b>键会将指定UI 最大Env内的所有内容直接放入当前UI的最大Env中
</p>

<p style="font-size:14px"><b>Export </b>键会将当前的UI生成为相应的验证环境
<>br>
具体文件结构为:
</p>

<p style="font-size:14px"><b>Specify Template Path </b>允许用户指定一个路径为当前UI生成环境时所参照的模板的绝对路径</p>
<p style="font-size:14px">

<b>1.</b> 默认文件模板：路径固定，用于方便用户编辑所有同类Component/Object
<br>
 e.g. 用户可以将默认的Monitor模板中的head template block 中加入注释”hello world”则所有生成的monitor文件中的head template block中都会加入”hello world”
<br>
<br>
<b>2.</b> 用户自定义文件模板：路径由用户在生成环境前指定，拓展会自动递归地搜索所有路径下的文件，如果有与当前UI中的Component/Object重名的文件，会以该文件为模板生成文件
<br>
e.g. 如果当前UI中一Component 名为”monitor_1”那么如果在用户指定的路径下有文件名为 ”monitor_1.sv” 的文件那么在所有”monitor_1.sv”的template block中的修改都会被继承到新的monitor_1的生成文件中
<br>
此功能是为了方便用户在用一个UI生成环境并在环境文件上做编辑后又用相同UI经过进一步调整后生成文件时，可以直接套用上次对该名字的环境文件的修改
</p>




</div>
