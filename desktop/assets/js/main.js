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


jQuery.fn.putCursorAtEnd = function() {
  return this.each(function() {
    $(this).focus()
    // If this function exists...
    if (this.setSelectionRange) {
      // ... then use it (Doesn't work in IE)
      // Double the length because Opera is inconsistent about whether a carriage return is one character or two. Sigh.
      var len = $(this).val().length * 2;
      this.setSelectionRange(len, len);
    } else {
    // ... otherwise replace the contents with itself
    // (Doesn't work in Google Chrome)

      $(this).val($(this).val());      
    }
    // Scroll to the bottom, in case we're in a tall textarea
    // (Necessary for Firefox and Google Chrome)
    this.scrollTop = 999999;
  });
};


$(function(){
	$.browser = {};
	var moz = $.browser.mozilla = /firefox/.test(navigator.userAgent.toLowerCase()); 
	var webkit=$.browser.webkit = /webkit/.test(navigator.userAgent.toLowerCase()); 
	$.browser.opera = /opera/.test(navigator.userAgent.toLowerCase()); 
	var ie=$.browser.msie = /msie/.test(navigator.userAgent.toLowerCase())
	 || !!navigator.userAgent.match(/Trident\/7\./);
	
	function init(){
		var forms = cfg.forms;
		if (isLogin){
			makeDesk(forms);
		}
		else
			login();
	}
	
	function nav_table(table){
		return;
	}
	
	function edit_table(name){
		var $container = $('#container_' + name);
		var $table = $('#tbl_' + name);
		var $currCell =  $table.find('tbody').find('tr:first td:first');
		var editting = false;
		var $editDiv = $('#edit');
		var $input = $editDiv.find('input[type=text]');
		$table.data('curCell',{curCell : $currCell,text : $currCell.text()});
		$container.attr('tabIndex',-1);
		//$table.attr('tabIndex',"-1");
		//
		function moveToCell($newCell){
			//获取老单元格信息
			var oldCellData = $table.data('curCell');
			var $oldCell = oldCellData.curCell;
			var oldText = oldCellData.text;
			//设置新单元格
			var $newTextNode = $newCell.contents().first();
			var text = $newTextNode.text();
						
			//设置edit div的高度,内容
			$editDiv.height($newCell.height() -2);
			$editDiv.find('#dsptext').text(text);
						
			//替换单元格文本节点
			if  ( $newTextNode.length )
				$newTextNode.replaceWith($editDiv);
			else
				$newCell.appCodeName($editDiv);
			
			$newCell.addClass('select');	
				
			//恢复老单元格
			$oldCell.removeClass('select');
			$oldCell.text(oldText);
			
			//保存newCell
			$table.removeData('curCell');
			$table.data('curCell',{curCell : $newCell,text : text});
			
			//设置 edit高度
			$input.css({'top' : -500});			
			$input.val(text).select();
			$input.removeAttr('focus').focus();			
		}
		
		$table.on('click',function(e){
			if (e.target.nodeName !== 'TD')
				return;
			
			moveToCell($(e.target));
		});
		
		$table.on('dblclick',function(e){
			if (!editting)
				editting = true;	
			
			showInput();
		});
		
		//显示$editDiv内的input编辑框
		function showInput(){		
			var focus = $input.attr('focus');
			if (!focus){
				$input.css({top : 0});						
					
				$input.select().focus();
				$input.attr('focus',1);
			}
		}
				
		$editDiv.on('keyup',function(e){
			var $curCellData = $table.data('curCell');
			$curCellData.text = $input.val();
			return true;
		});

		$editDiv.on('keydown',function keydown(e){
			if ($.inArray(e.keyCode,[9,37,38,39,40])>-1 || e.keyCode <20 && $.inArray(e.keyCode,[0,8])==-1)
			{
				handleKey(e);
				return true;
			}

			//显示文本框接收键盘输入 important
			showInput();
		});
		
		function handleKey(e){
			if ( editting && $.inArray(e.keyCode,[37,38,39,40])>-1)
				return true;
			
		};
		
		function direction(e){
			var d = (-1);
			var shift = e.shiftKey , ctrl = e.ctrlKey ,alt = e.altKey,keyCode = e.keyCode;
			var oldrow = currentCell[0], oldcol = currentCell[1];
			var row = oldrow, col = oldcol;
			var rows = data.length,cols = columns.length;
			
			//如果edit是编辑状态，不响应单元格左右移动事件
			if ((keyCode === 39 || keyCode ===37) && editting)
				return false;
				
			if (keyCode === 9) {
				if (shift) d = 3;
				else d = 1;
			}
			if (keyCode ===39 ) {
				d =1; //right
			}
			if (keyCode ===37) {
				d =3; //left
			}
			if (keyCode ===40 || keyCode ===13) {
				d =2; //down
			}
			if (keyCode ===38) {
				d =0; //top
			}			
			if (d == 0 ) {
				if (  row > 0)
					row--;
			}
			if (d == 1 ) {
				if ( col == cols-1 && row < rows-1)
				{
					col =0;
					row++;
				}			
				else if ( col < cols-1) 
					col ++;
			}
			if (d == 2 ) {
				if (  row < rows-1)
					row++;
			}	
			if (d == 3 ) {
				if ( col == 0 && row > 0){
					col = cols - 1;
					row--;
				}
				else if ( col > 0) 
					col --;				
			}
			
			if (d > -1)
				e.preventDefault();
			if ( oldrow !== row || oldcol !== col){
				editting = false;
				return $table.find('td[row=' + row + '][col=' + col +']');
			}
			else
				return false;
		}		
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
			
		var Computer = Model('computer');
		Computer.add(new Computer({name : '联想', model : 'X-Y110',cpu : 'Intel' , memory : '4G'}));
		Computer.add(new Computer({name : '联想', model : 'X-Y110',cpu : 'Intel' , memory : '4G'}));
		Computer.add(new Computer({name : '联想', model : 'X-Y110',cpu : 'Intel' , memory : '4G'}));
		Computer.add(new Computer({name : '联想', model : 'X-Y110',cpu : 'Intel' , memory : '4G'}));
		Computer.add(new Computer({name : '联想', model : 'X-Y110',cpu : 'Intel' , memory : '4G'}));
		Computer.add(new Computer({name : '联想', model : 'X-Y110',cpu : 'Intel' , memory : '4G'}));
		Computer.add(new Computer({name : '联想', model : 'X-Y110',cpu : 'Intel' , memory : '4G'}));
		Computer.add(new Computer({name : '联想', model : 'X-Y110',cpu : 'Intel' , memory : '4G'}));
		Computer.add(new Computer({name : '联想', model : 'X-Y110',cpu : 'Intel' , memory : '4G'}));
		Computer.add(new Computer({name : '联想', model : 'X-Y110',cpu : 'Intel' , memory : '4G'}));
				
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
		var html = getGrid('computer',Computer.collection,cols);
		$('div#computer .window_main').append($(html));
		edit_table('computer');
		//nav_table('#tbl_computer');
		
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