/*
	日期 ：10:43 2011/1/26
	作者 ：Lay
	QQ    : 329118098
	Email	: veryide@qq.com
	Blog	: http://www.veryide.com/
	版本 ：V1.1

	/////////////////////////////////////

	内容关键字高亮
	
	dict		数据字典
	boxs		内容数组
	style		替换样式，支持以下智能标签
				{$key}		关键字
				{%key}		编码后的关键字
				{$link}		链接地址
				{%link}		编码后的链接地址
	ignore		忽略的标签
	multi		是否多次替换，默认为 true
	
	返回
		成功匹配次数
	
*/

var TextLink = function( dict , boxs , style , ignore , multi ){
	
	//数据字典
	this.Dict = dict;
	
	//内容数组
	this.Boxs = boxs;
	
	//替换成结果
	this.Style = style ? style : '<a target="_blank" title="{$link}" href="{$link}">$1</a>';
	
	//接受替换的标签
	this.Tags = ['b','p','strong','td','div','span','h1','h2','h3','h4','h5','h6','blockquote','center','body','code','dd','dt','dl','ul','ol','li','em','font','form','i','label','fieldset','marquee','pre','table','tbody','tfoot','thead','title'];
	
	//替换多次
	this.Multi = typeof multi != 'undefined' ? multi : true;
	
	/////////////////////////////

	//字典长度
	this.Longs = this.Dict.length;
	
	//匹配次数
	this.Count = 0;
	
	/////////////////////////////

	/*
		在数组内搜索某值
	*/
	this.InArray = function( array , value ){

		var l = array.length;
		for(var i=0; i<=l; i++) {
			if( array[i]== value ) return i;
		}
		return -1;	

	}
	
	/*
		在数组内搜索某值
	*/
	this.Replace = function( text ){

		//遍历数组
		for( var i = 0; i < this.Longs; i++ ){
	
			//关键字
			var key = this.Dict[i][0];						
	
			//链接
			var link = this.Dict[i][1].replace( '{$key}' , key ).replace( '{%key}' , encodeURIComponent(key) );
	
			//表达示（多次或单次）
			var r = new RegExp( "("+key+")", this.Multi ? "ig" : "i" );
	
			//如果找到
			if( r.test( text ) ){
	
				//替换内容
				var str = this.Style.replace( /\{\%key\}/gm , encodeURIComponent(key) ).replace( /\{\$key\}/gm , key ).replace( /\{\$link\}/gm , link ).replace( /\{\%link\}/gm , encodeURIComponent(link) );
					
				//替换为带链接的文本
				text = text.replace( r , str );
	
				//记数
				this.Count++;
	
				//不复制替换
				if( !this.Multi && this.Longs > 0 ){
	
					//从字典删除
					this.Dict.splice( i ,1 );
	
					//重新计算字典长度
					this.Longs --;	
	
				}
			}
		}
		
		return text;

	}
	
	/*
		处理节点
	*/
	this.Node = function( node ){
		
		switch( node.nodeType ){
			
			//元素节点
			case 1:
			
				//子节点数量
				var e = node.childNodes;
	
				for( var n = 0; n < e.length && this.Longs; n++ ){
					
					//元素节点
					if( e[n].nodeType == 1 ){
				
						//小写标签名
						var tag = e[n].tagName.toLowerCase();
						
						//忽略标签
						if( ignore.length && this.InArray( ignore , tag ) > -1 ){						
							continue;						
						}
					
					}
					
					//处理子节点
					this.Node( e[n] );
					
				}
			
			break;
			
			//文本节点
			case 3:
			
				//源内容
				var s = node.nodeValue;
				
				//替换字典
				if( s ){
					
					var newNode = document.createElement("span");
					
					//var newNode = document.createDocumentFragment();
					
					newNode.innerHTML 	= this.Replace( s );
					
					//node.replaceNode( newNode );
					
					this.Child( node , newNode );
					
				}
			
			break;
			
		}
		
	}
	
	this.Child = function( o , n ){
	
		o.parentNode.replaceChild( n , o ); 
	
	}
	
	/*
		初始化
	*/
	this.Init = function( ){
		
		//内容源
		var s = null;
		
		//子元素
		var e = null;
		
		//遍历内容区
		for( var j = 0; j < this.Boxs.length && this.Longs; j++ ){
		
			//对象不存在
			if( !this.Boxs[j] ) break;
		
			//子节点数量
			e = this.Boxs[j].childNodes;
			
			//遍历子元素
			for( var n = 0; n < e.length && this.Longs; n++ ){
				
				//没有子子点
				if( !e[n] ) break;
				
				//元素节点
				if( e[n].nodeType == 1 ){
				
					//小写标签名
					var tag = e[n].tagName.toLowerCase();
					
					//忽略标签
					if( ignore.length && this.InArray( ignore , tag ) > -1 ){						
						continue;						
					}
					
				}
				
				this.Node( e[n] );
				
			}
			
		}
		
		return this.Count;		
	}
	
	return this.Init();
		
}