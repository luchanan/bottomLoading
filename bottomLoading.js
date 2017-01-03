var BottomLoading=(function($,window){
    var _this;
    var defaults ={
        addTo:'',//加载样式
        callback:null,
        beforeSend:null,
        toBottom:-1,
        pageCount:1,
        currentPage:1,
        isScroll:false,
        loading_text:"数据加载中...",
        finish_text:"上拉加载更多",
        no_more_text:"没有更多了",
        fail_text:"加载失败,点击重试",
        url:"",
        data:"",//数据参数
        first:true,
        beforeLoad:null,
        container:window,
    };
    function BottomLoading(options){
        this.settings=$.extend({},defaults,options || {});
        _this=this;
        this.init();
    }
    BottomLoading.prototype={
        init:function(){
            this.create();
            var _this=this;
            $(this.settings.container).unbind("scroll").bind("scroll",function(){
                var wh=$(window).height()+$(window).scrollTop();
                var dh=$(document).height();
                var a=wh-dh;
                if(a<=0) _this.settings.toBottom=-1;
                if(_this.settings.isScroll) return;
                if(a>=_this.settings.toBottom){
                    _this.settings.isScroll=true;
                    _this.beforeSend();
                    _this.getData();
                }
            });
        },
        //更多是否在可视窗口
        isView:function(){
            var eoh=$(this.settings.htmlTemplete).offset().top;
            var wh=$(this.settings.container).height() + $(this.settings.container).scrollTop();
            if($(this.settings.container).scrollTop()>eoh||wh<eoh){
                //console.log('离开视区域');
                return false;
            }
            else{
                //console.log('在可视区域');
                return true;
            }
        },
        beforeSend:function(){
            //异步请求前需要刷新参数
            if($.isFunction(this.settings.beforeSend)){
                this.settings.data=this.settings.beforeSend();
            }
        },
        beforeLoad:function(){
            //异步请求前需要刷新参数
            if($.isFunction(this.settings.beforeLoad)){
                this.settings.beforeLoad();
            }
        },
        //获取数据
        getData:function(){
            var _this=this;
            $.ajax({
                url:_this.settings.url,
                data:_this.settings.data,
                dataType:'json',
                beforeSend:function(){
                    $(_this.settings.htmlTemplete).addClass('loading').children('.pullUpLabel').html(_this.settings.loading_text);
                },
                success:function(result){
                    setTimeout(function(){
                        //第一次加载标志
                        if(_this.settings.first){
                            _this.settings.first=false;
                        }
                        _this.settings.isScroll=false;
                        _this.settings.jsondata=result;
                        $(_this.settings.htmlTemplete).removeClass('loading').children('.pullUpLabel').html(_this.settings.finish_text);
                        _this.callback(result);
                        if(_this.isView()){
                            $(_this.settings.htmlTemplete).click();
                        }
                    },0);

                },
                error:function(){
                    _this.settings.isScroll=false;
                    $(_this.settings.htmlTemplete).removeClass('loading').children('.pullUpLabel').html(_this.settings.fail_text);
                }
            });
        },
        //生成
        create:function(){
            var temp=$('<div class="pullUp">');
            this.settings.htmlTemplete=temp;
            this.settings.htmlTemplete.append('<span class="pullUpIcon"></span><span class="pullUpLabel">'+this.settings.finish_text+'</span>')
            $(this.settings.htmlTemplete).appendTo(this.settings.addTo);
            $(this.settings.htmlTemplete).click($.proxy(function(){
                if(!this.settings.isScroll){
                    this.beforeSend();
                    this.getData();
                }
            },this));
            if(this.isView()){
                $(this.settings.htmlTemplete).click();
            }
        },
        //json返回数据回调，需要拼接
        callback:function(result){
            var _this=this;
            if($.isFunction(this.settings.callback)){
                this.settings.callback(result);
            }
        }
    }
    return{
        //没有更多了，禁止操作
        noMore:function(){
            $(_this.settings.htmlTemplete).children('.pullUpIcon').hide();
                $(_this.settings.htmlTemplete).removeClass('loading').children('.pullUpLabel').html(_this.settings.no_more_text);
                _this.settings.isScroll=true;
        },
        bottomLoading:function(options){
            var bo=new BottomLoading(options);
        },
        setPageCount:function(count){
            _this.settings.pageCount=count;
        },
        setCurrentPage:function(count){
            _this.settings.currentPage=count;
        },
        getPageCount:function(count){
            return _this.settings.pageCount;
        },
        getCurrentPage:function(count){
            return _this.settings.currentPage;
        },
        isFirst:function(){
            return _this.settings.first;
        }
    }
    //window.bottomLoading=$.bottomLoading=bottomLoading;
})(window.jQuery||window.Zepto,window);