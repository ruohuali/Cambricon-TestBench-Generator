<h1 align="center">Cambricon TestBench Generator</h1>
<br>
<p style="font-size:18px; font-family:arial;"><i>Cambricon TestBench Generator</i> 是一款基于vscode开发用于UVM验证平台环境生成的</p>
<p style="font-size:18px;">webview拓展，可以使用户在vscode中通过设计UI界面自动生成对应的UVM验证环境</p>
<br>
<br>


<div id="menu" style="background-color:lightblue; height:1000px;width:400px; float:left;">
<h2>UI界面</h2>
<br>
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

<img src="https://github.com/ruohuali/Cambricon-TestBench-Generator/blob/master/Demo_snapshots/Demo1.PNG" align="right" width="100px" height="100px"/>


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



</div>
