var isLogin = true;
var ICON_PATH='assets/images/icons/'
var formCount={};

var cfg={
	forms : [{
		name : 'computer',
		title : '电脑',
		small : ICON_PATH + 'icon_16_computer.png',
		medium : ICON_PATH + 'icon_22_computer.png',
		large : ICON_PATH + 'icon_32_computer.png'
		}
		,{
		name : 'drive',
		title : '硬盘',
		small : ICON_PATH + 'icon_16_drive.png',
		medium : ICON_PATH + 'icon_22_drive.png',
		large : ICON_PATH + 'icon_32_drive.png'
	}]
}
function Form(options){
	
}

$(function(){
	function init(){
		var forms = cfg.forms;
		if (isLogin){
			makeDesk(forms);
		}
		else
			login();
	}
	
	function makeDesk(forms){
		var icons = [];
		var wins = [];
		var tasks = [];
		for(var i = 0 ; i < forms.length ; i ++)
		{
			icons.push({
				name : forms[i].name 
				,src : forms[i].large
				,title : forms[i].title
			});
			wins.push({
				name : forms[i].name 
				,src : forms[i].small
				,title : forms[i].title
			});
			tasks.push({
				name :  forms[i].name 
				,src : forms[i].medium
				,title : forms[i].title
			});
		}	
		getIcon(icons);
		getWin(wins);
		getTasks(tasks);
		
		AddComputer();
	}
	
	function getIcon(icons){
		var h = $('#desktop').height();
		var rows = Math.floor(h / 80);
		var l = icons.length;
		var x = 0,y = 0;
		var $href;
		
		for(var i = 0 ; i < l;i++)
		{
			x = Math.floor(i / rows);
			y = i % rows
			
			$href = $(getTpl('#icon-tpl',icons[i])).appendTo('#desktop');
			$href.css({'left' : x*80 + 20,'top' : 20+y*80});
		}	
	}
	
	function getWin(wins){
		var $win;
		var l = wins.length;
		
		for(var i = 0 ;i < l ; i++){
			$win = $(getTpl('#win-tpl',wins[i])).appendTo('#desktop');
		}
	}
	
	function getTasks(tasks)
	{
		var $task;
		var l = tasks.length;
		
		for(var i = 0 ;i < l ; i++){
			$task = $(getTpl('#task-tpl',tasks[i])).appendTo('#dock');
		}
	}
	
	function getTpl(tplName,data)
	{
		var source = $(tplName).html();
		var template = Handlebars.compile(source);
		
		return template(data);
	}
	
	function AddComputer()
	{
		var cols = [
			{name : 'name',title : '名称'}
			,{name: 'model',title : '型号'}
			,{name : 'cpu', title : 'CPU'}
			,{name : 'memory', title : '内存'}
			];
			
		var data = [{
			  name : '联想', model : 'X-Y110',cpu : 'Intel' , memory : '4G'}
			,{name : '联想', model : 'X-Y110',cpu : 'Intel' , memory : '4G'}
			,{name : '联想', model : 'X-Y110',cpu : 'Intel' , memory : '4G'}
			,{name : '联想', model : 'X-Y110',cpu : 'Intel' , memory : '4G'}
			,{name : '联想', model : 'X-Y110',cpu : 'Intel' , memory : '4G'}
			,{name : '联想', model : 'X-Y110',cpu : 'Intel' , memory : '4G'}
			,{name : '联想', model : 'X-Y110',cpu : 'Intel' , memory : '4G'}
			,{name : '联想', model : 'X-Y110',cpu : 'Intel' , memory : '4G'}
			,{name : '联想', model : 'X-Y110',cpu : 'Intel' , memory : '4G'}
			,{name : '联想', model : 'X-Y110',cpu : 'Intel' , memory : '4G'
		}];
		
		 
		//$('#computer > div.window_main').append(getGrid('computer',data,cols));
		var html = getGrid('computer',data,cols);
		$('div#computer .window_main').append($(html));
		
		console.log(html);
	}
	
	function getGrid(id, data , cols) {
		var source = $('#grid-tpl').html();
		var template = Handlebars.compile(source);
		var colList = [];
		var colKey = [];
		$.each(cols , function(i,col){
			colList.push(col.title);
			colKey.push(col.name);
		});
		
		return template({
			name : id
			,data : data
			,col : colList
			,colKey : colKey
		});
	}
	
	init();
	JQD.go();
})