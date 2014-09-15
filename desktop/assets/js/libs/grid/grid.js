+(function($){
	$.browser = {};
	var moz = $.browser.mozilla = /firefox/.test(navigator.userAgent.toLowerCase()); 
	var webkit=$.browser.webkit = /webkit/.test(navigator.userAgent.toLowerCase()); 
	$.browser.opera = /opera/.test(navigator.userAgent.toLowerCase()); 
	var ie=$.browser.msie = /msie/.test(navigator.userAgent.toLowerCase()); 

	function ToggleCapture () {	
		if (capturing) {
			if (window.removeEventListener) {   // all browsers except IE before version 9
				capturing = false;
				window.removeEventListener ("mousemove", MoveSquare, true);
			}
			else {
				if (square.releaseCapture) {    // IE before version 9
					square.releaseCapture ();
				}
			}
		}
		else {
			if (window.addEventListener) {  // all browsers except IE before version 9
				capturing = true;
				window.addEventListener ("mousemove", MoveSquare, true);
			}
			else {
				if (square.setCapture) {    // IE before version 9
					capturing = true;
					square.setCapture ();
				}
			}
		}
	}
	
	function disableSelection() {
	   document.onselectstart = function() {return false;} // ie
	   document.onmousedown = function() {return false;} // others
	}
	
	function enableSelection() {
	   document.onselectstart = null; // ie
	   document.onmousedown = null; // others
	}
	//window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty(); 
	var grid=function(container,data,columns,options){
		var defaults = {
			headerHeight : 20,
			rowHeight : 20,
			columnWidth : 50,
			rows : 20
		};
				
		var opt = $.extend({},defaults,options);
		var $container,$table;
		var $header;
		var tableLeft ,tableTop;
		var editors = {};
		var currentCell = [0,0];
		var bEdit = false;
		
		var $cellHintBox = $('<div></div>')
		var $cellMask = $('<div style="z-index:-500;"></div>');
					
		//mousemove 感应
		var area = [];
		var $headerDragDiv=$("<div class='tbl-header-drag'></div>");
		//为数据建立index到fieldname的映射
		
		var dataIndex={};
		var indexData=[];
		//表格、cellBox框、chrome，firefox输入框遮挡的z-index
		var gridzIndex ;
		var cellMaskzIndexHide ;
		var cellMaskzIndexShow ;
		var cellHintzIndex;
		
		function initIndexData(){
			var i = 0;
			for ( var m in data[0]){
				dataIndex[m]=i;
				indexData[i]=m;
				i++;
			}
		}
		
		function getDataByIdx(row,i){
			return data[row][indexData[i]];
		}
		
		function setDataByIdx(row,i,value){
			data[row][indexData[i]] = value;
		}
		
		//初始化单元格编辑器
		function initEditors(){
			editors['text'] = Grid.Editors.Text();
		}
		//表头识别区域
		function putHeaderArea(){
			var ths = $header.find('th');
			var l=0,t,r,b;
			area['header']=[];
			$.each(ths,function(i,th){
				l =$(th).offset().left+$(th).width() -2.5;
				t =$(th).offset().top;
				r =$(th).offset().left+$(th).width() +2.5;
				b =$(th).offset().top + $(th).height();
				
				area['header'].push([l,t,r,b]);
			});
		}
		//更新拖拽区域位置
		function updateArea(index,left,top,right,bottom){
			area[header][index] =[left,top,right,bottom];
		}
		//返回点是否在拖拽区域
		function inDragArea(x){
			var inArea = -1;
			$.each(area["header"],function(i,item){
				if(item[0] <= x && x <= item[2])
				{
					inArea = i;
					return false;
				}	
			});
			
			return inArea;
		}
		//初始化
		function init(){
			$container = $(container);
			if ($container.length < 1)
			{
				$container=$('<div class="no-select"><div>');
			}
			//建立字段名、索引的映射；
			initIndexData();
			
			$table = $('<table></table>').appendTo($container);
			//表头
			//disableSelection();
			$header =$(getHeader());
			
			$table.append($header);
			$table.append(rows());
			
			$table.width('210px');
			$table.addClass('grid no-select');
			//尽量最后加class，否则table-layout:fixed在chrome下不能正常工作
			
			gridzIndex = $table.css('z-index') || 500;
			cellMaskzIndexHide = parseInt(gridzIndex) - 50;
			cellHintzIndex = parseInt(gridzIndex) + 100;
			cellMaskzIndexShow = parseInt(cellHintzIndex) +50;
			
			$cellHintBox.css({
				   overflow : 'hidden'
				  ,position : 'absolute'
				  ,border : '1px solid #000'
				  ,'z-index' : cellHintzIndex
				  });
		    $cellMask.css({
				   overflow : 'hidden'
				  ,position : 'absolute'
				  ,'background-color' : 'White'
				  ,border : '0'
				  });	
			
			$container.append($cellMask);
			$container.append($cellHintBox);
			$container.append($headerDragDiv);
			
			if( moz || webkit) {
				$container.attr('tabIndex',-1);
			}
			$container.on('keydown',keydown)
			//mousemove 感应区域
			putHeaderArea();		
			//拖拽捕捉
			$header.mousecapture({
				'down' : function(e,s){
					var x = e.pageX - $(this).position().left; 
					var index = inDragArea(x); //当前点是否在拖拽提示区
					if (inDragArea(x)>-1){
						s.x = e.pageX;  //记录起始拖拽位置
						s.index = index;  //记录拖拽index
						$headerDragDiv.show();
						$headerDragDiv.css({left : e.pageX - $(this).offset().left,top : 0});
					}
				}
				,'move' : function(e,s){
					$headerDragDiv.css({
						left : e.pageX - $(this).offset().left
						,top : 0
					});	
					if (e.pageX - $container.width() > 0 )
					{
						
					}						
				}
				,'up' : function(e,s){
					var curth = $table.find('th')[s.index];
					$table.width($table.width()+(e.pageX-s.x));
					$(curth).width($(curth).width()+(e.pageX-s.x));
					$headerDragDiv.hide();
				}
			});
			//拖拽提示
			$header.mousemove(function(e){
				if (inDragArea(e.pageX - $(this).position().left)>-1){
					$(this).addClass('resizing');
				} else
				{
					$header.removeClass('resizing')
				}
			});
			//table单击单元格选择
			$container.click(function(event){
				var $t = $(event.target);
				var nodeName= $t[0]['tagName'] 
				
				if (nodeName === 'TD'){
					locateInput($(event.target));
				}
			});
			//双击进入单元格编辑状态
			$container.dblclick(function(event)
			{		
				if (bEdit === false){
					bEdit = true;
				}
				showInput();	
			});
			//文本框写入div
			$cellMask.on('keyup',function(event)
			{	
				if ( $.inArray(event.keyCode,[9,37,38,39,40])>-1 || event.keyCode <20 && event.keyCode !==8)
				{			
					return false;
				}
								
				var $cur = getCurrentCell();
				var input = $cellMask.children('input[type=text]');
				var txt = input.val();
				if ( txt !== $cur.html())
				{
					$cur.html(txt || '&nbsp;');
					setDataByIdx(currentCell[0],currentCell[1],txt);
				}
				//console.log('up:'+event.keyCode);
			});	
		}
		
		function keydown(event)
		{
			if ($.inArray(event.keyCode,[9,37,38,39,40])>-1 || event.keyCode <20 && $.inArray(event.keyCode,[0,8])==-1)
			{
				handleKey(event);
				return true;
			}

			//显示文本框接收键盘输入 important
			showInput();
			//console.log('down:'+event.keyCode);
		}		
		//显示$edit内的input编辑框
		function showInput(){		
			var input = $cellMask.children('input[type=text]');
			var focus = input.attr('focus');
			if (!focus){
				input.attr('focus',1);
				if(ie)
					input.css({top : 0});		
				
				$cellMask.css({border : '1px solid black','z-index':cellMaskzIndexShow});
				input.css('z-index',cellMaskzIndexShow+100);
				input.select().focus();
			}
		}
		//定位表格单元格
		function locateInput($td)
		{
			var $t = $td;
			var row = $t.attr('row'),col=$t.attr('col');
			var left=$t.position().left+1  ,top=$t.position().top+1 ,w=$t.width(),h=$t.height();
			
			$cellHintBox.css({
					  left : left
					  ,top : top
					  ,width : w 
					  ,height: h
					  ,'z-index' : cellHintzIndex
					  });
			$cellMask.css({
					  left : left
					  ,top : top
					  ,width : w 
					  ,height: h
					  ,'z-index' :  cellMaskzIndexHide
					  });			
			var cellType = columns[col].type || 'Text';
			//input加入$cellMask
			var args = {container : $cellMask}
			if (!editors['text'])
				editors['text'] = new Grid.Editors.Text(args);
			editors['text'].loadValue(data[row][columns[col].field]);
			
			currentCell[0] = row , currentCell[1] = col;
			
			var input = $cellMask.children('input[type=text]');
			input.css({position : 'absolute',width :w ,height:h});
			
			if ( ie ){
				input.css({top:-50});
			}
			if(moz || webkit){
				input.css({'z-index': parseInt(cellMaskzIndexHide)-100});		
			}
			input.removeAttr('focus').focus();
		}
		
		function getCurrentCell(){
			var row = currentCell[0],col = currentCell[1];
			return $table.find('td[row=' + row + '][col=' + col +']')
		}
		
		function handleKey(event) {
			var $t = $(event.target);
			var nodeName= $t[0]['tagName'];
			
			if ( (nodeName==='INPUT' || nodeName==='DIV') ){
				var current = direction(event);
				if (!!current)
					locateInput(current);
			}			
		}
		
		function direction(e){
			var d = (-1);
			var shift = e.shiftKey , ctrl = e.ctrlKey ,alt = e.altKey,keyCode = e.keyCode;
			var oldrow = currentCell[0], oldcol = currentCell[1];
			var row = oldrow, col = oldcol;
			var rows = data.length,cols = columns.length;
			
			//如果edit是编辑状态，不响应单元格左右移动事件
			if ((keyCode === 39 || keyCode ===37) && bEdit)
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
				bEdit = false;
				return $table.find('td[row=' + row + '][col=' + col +']');
			}
			else
				return false;
		}
		
		function colDef(){
			var colHtml = [];
			
			for(var i = 0 ; i < columns.length ; i ++ ){
				colHtml.push('<col width=70px"/>');
			}
			
			return colHtml.join("");
		}
		function getHeader(){
			var thHtml = [];
			for(var i = 0 ; i < columns.length ; i ++ ){
				thHtml.push('<th col=' + i + '>' + columns[i].name + '</th>');
			}
			
			return '<thead><tr>' + thHtml.join("") + '</tr></thead>';
		}
		
		function rows(){
			var rows =[];
			var firstRow=[];
			var firstHtml;
			//insert First Row
			for(var i = 0 ; i < columns.length ; i ++ ){
				firstRow.push('<td style="height:0px;width:70px"/>');
			}
			firstHtml="<tr class='first-row'>" + firstRow.join("")+"</tr>";
			for(var i = 0 ; i < data.length ; i ++ ){
				rows.push(renderRow(i));
			}
			
			return firstHtml + rows.join("");
		}
		
		function renderRow(row){
			var tds=[];
			for(var i = 0 ; i < columns.length ; i ++ ){
				tds.push('<td row='+ row + ' col=' + i + '>' + data[row][columns[i].field] + '</td>');
			}
			
			rowHtml = '<tr row=' +row +'>' + tds.join("") + '</tr>';
			return rowHtml;
		}
		
		init();
	}
	
	  $.extend(true, window, {
		"Grid": {
			grid : grid
		  }
	  });

})(jQuery);