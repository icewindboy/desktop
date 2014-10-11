var isLogin = true;
var ICON_PATH = 'assets/images/icons/';
var formCount = {};

var cfg = {
	forms : [
		{
			name : 'computer',
			title : '电脑',
			small : ICON_PATH + 'icon_16_computer.png',
			medium : ICON_PATH + 'icon_22_computer.png',
			large : ICON_PATH + 'icon_32_computer.png'
		},
		{
			name : 'drive',
			title : '硬盘',
			small : ICON_PATH + 'icon_16_drive.png',
			medium : ICON_PATH + 'icon_22_drive.png',
			large : ICON_PATH + 'icon_32_drive.png'
		}
	]
};

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
	
	Editor = {
		'text' : TextEditor
	};
	function init(){
		var forms = cfg.forms;
		if (isLogin){
			makeDesk(forms);
		}
		else
			login();
	}
	
	function TextEditor(args){
		var editting = false;
		var $editDiv = $('#edit');
		var $input = $editDiv.find('input[type=text]');
		
		init();
	}
	
	function nav_edit_table(name, model,cols){
		var $container = $('#container_' + name);
		var $table = $('#tbl_' + name);
		var $curCell =  $table.find('tbody').find('tr:first td:first');
		var editting = false;
		var $editDiv = $('#edit');
		var $input = $editDiv.find('input[type=text]');
		var editors =[];
		
		$table.data('curCell',{curCell : $curCell,text : $curCell.text()});
		$container.attr('tabIndex',-1);
		
		function getEditor($cell){
			var index = $cell.index();
			var editor = cols[index].editor || 'text';
			
			return Editor[editor];
		}
		
		function moveToCell($newCell){
			//获取老单元格信息
			var oldCellData = $table.data('curCell') || { 
				curCell : curCell,text : curCell.text()
			};
			var $oldCell = oldCellData.curCell;
			var oldText = oldCellData.text;
				
			//恢复老单元格
			$oldCell.removeClass('select');
			$oldCell.text(oldText);
			
			//设置新单元格
			var $newTextNode = $newCell.contents().first();
			var text = $newTextNode.text();
			//替换单元格文本节点
			if  ( $newTextNode.length )
				$newTextNode.replaceWith($editDiv);
			else
				$newCell.append($editDiv);
			$newCell.addClass('select');	
			//保存newCell
			$table.removeData('curCell');
			$table.data('curCell',{curCell : $newCell,text : text});
			
			//设置edit div的高度,内容
			$editDiv.height($newCell.height() - 4);
			$('#edittext').height($newCell.height() - 4);
			$('#dsptext').text(text);		
			//设置 $input			
			$('#dsptext').css('z-index' , 1000);
			$input.removeAttr('focus');
			$input.val(text).select();		
			editting = false;
		}
		
		$table.on('click','td',function(e){
			//查询当前是否点击到一个TD区域了
			console.log('click');
			var $t = $(e.target).closest('td');
			if (!$t.is($table.data('curCell').curCell))
				moveToCell($t);
			else
				showInput();
		});

		$table.on('dblclick','td',function(e){
			console.log('dblclick');
			if (!editting)
				editting = true;	
		});
		//append等操作可能导致绑定事件丢失，委托table进行
		$table.off('keyup keydown');
		$table.on('keyup',$editDiv,function(e){
			console.log(e.keyCode);
			console.log(e.target);
			var $curCellData = $table.data('curCell');
			$curCellData.text = $input.val();
			return true;
		});

		$table.on('keydown',$editDiv,function keydown(e){
			console.log(e.keyCode);
			console.log(e.target);
			if ($.inArray(e.keyCode,[9,37,38,39,40])>-1 || e.keyCode <20 && $.inArray(e.keyCode,[0,8])==-1)
			{
				handleKey(e);
				return true;
			}
			//显示文本框接收键盘输入 important
			showInput();
		});			
		//显示$editDiv内的input编辑框
		function showInput(){		
			setTimeout(function()
			{
				var focus = $input.attr('focus');
				if (!focus){
					$('#dsptext').css('z-index' ,800);				
					//$input.parent().css('z-index' , 1000+100);	
					$input.attr('focus',1);
					$input.focus();
					}
			},0);
		}
			
		function handleKey(e){
			var shift = e.shiftKey , ctrl = e.ctrlKey ,alt = e.altKey,keyCode = e.keyCode;
			var c = $table.data('curCell').curCell;
			var d = "";
			var moveTo;
			var rows = $table.find('tbody tr').length;
			var cols = $table.find('tbody tr:first').find('td').length;
			
			if ( editting && $.inArray(e.keyCode,[37,38,39,40])>-1)
				return true;
			
			if ( keyCode === 37 || shift && keyCode === 9 ) d = "l";
			if ( keyCode === 38  ) d = "t";
			if ( keyCode === 39 || keyCode === 9 && !shift ) d = "r";
			if ( keyCode === 40 || keyCode === 13) d = "b";
			
			if ( d !== "") {
				moveTo = navigator( c ,d , rows , cols);
				if ( moveTo.length && !c.is(moveTo) )
					moveToCell(moveTo);
					
				e.preventDefault();	
				editting = false;
			}
		};
		//返回下个单元格
		function navigator(active , d , rows ,cols)
		{
			var x = active.index();
			var y = active.closest('tr').index();
			var pos = (y) * cols + x ;
			var $next = active;
			var len = rows * cols - 1;
			var end = 0;
			
			if (d == 'l')  (pos > 0 )? pos-- : end++;                         //left
			if (d == 't')  (pos > cols - 1) ? pos -= cols : end++;            //top
			if (d == 'r')  (pos < len) ? pos++ :  end++;                      //right
			if (d == 'b')  (pos + cols - 1 < len) ? pos += cols : end++;      //bottom
			
			if ( end )
				return $next;
				
			var $next = $table.find('tbody tr').eq(Math.floor(pos / cols)).find('td').eq(pos % cols);
			
			return $next;
			/*
			//递归的一个例子，控制不移动到某列
			if ($next.is(':visible') && $next.index() != 0 && $next.index() != 1 )
				return $next;
			else
			{
				if ( pos < 2 ) return active;
				else
					return navigator($next ,d ,rows ,cols);			
			}
			*/
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
		
		addComputer();
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
	
	function addComputer()
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
		 
		var html = getGrid('computer',Computer.collection,cols);
		$('div#computer .window_main').append($(html));
		nav_edit_table('computer');
	}

	function getGrid(id, data , cols) {
		var source = $('#grid-tpl').html();
		var template = Handlebars.compile(source);
		
		return template({
			name : id
			,data : data
			,col : cols
		});
	}
	
	init();
	JQD.go();
})