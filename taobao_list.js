var allow_lo=Common.goLogin();
if(allow_lo==undefined){
    //已登录
    if(Common.isPc()){
        window.location.href=Common.pcLoginUrl;
    }
    Common.update_common_parames();
    setCurrentOn();
    getList();
    Common.config.last_index=0;
}
else{
    //未登录
    if(Common.isPc()){
        window.location.href=Common.pcLoginUrl;
    }
}
var showLoading;
//指示器
showLoad();
function showLoad(){
    showLoading=dialog({
                    type:0,
                    overlay:false
                });
    showLoading.open();
}
function closeLoading(){
    if(showLoading!=undefined){
        showLoading.closed();
        showLoading=null;
    }
}
function setCurrentOn(){
    $("header .right .client").off().click(function(){
        //统计代码
        delayClick(event, this, 100, function(){ _czc.push(['_trackEvent','淘宝订单', '联系客服', '']); });
    });
    /*来源判断显示*/
    wechatSource();
}
//全部订单
function getList(){
    $.ajax({
        url:Common.ip+'/Order/getTBOrderList',
        data:Common.config,
        dataType:Common.dataType,
        success:function(data){
            closeLoading();
            delete Common.config.pay_status;
            delete Common.config.last_index;
            if(data.error_code=='0000'){
                var list_all = template('list_all_temp',data);
                document.getElementById('list_all').innerHTML = list_all;
                setCurrentOn();
                var last_index=data.last_index;
                var tao_name=data.tao_account;
                if(tao_name==""||tao_name==undefined){
                    $("#taobao_name").html("<span style='visibility:hidden'>无</span>");
                }
                else{
                    $("#taobao_name").html("淘宝ID："+tao_name);
                }
                lazyLoad();
                if(last_index==0){
                    return;
                }
                BottomLoading.bottomLoading({
                    addTo:'#bottomLoading',
                    url:Common.ip+'/Order/getTBOrderList',
                    dataType:Common.dataType,
                    data:Common.config,
                    beforeSend:function(){
                        //开始请求的时候要刷新一下pageCount，currentPage
                        //也就是当前页，和之前页
                        Common.update_common_parames();
                        Common.config.last_index=parseInt(last_index);
                        var first=BottomLoading.isFirst();
                        //第一次访问pageCount==currentPage;
                        if(first){
                            BottomLoading.setPageCount(last_index);
                            BottomLoading.setCurrentPage(last_index);
                        }
                        return Common.config;//返回更新参数
                    },
                    callback:function(data){
                        //ajax返回的数据,拼接,根据返回的索引，来判断是否显示结束
                        if(parseInt(data.last_index)<=parseInt(BottomLoading.getPageCount())&&!BottomLoading.isFirst()||data.order_list.length==0){
                            BottomLoading.noMore();
                        }
                        BottomLoading.setPageCount(data.last_index);
                        last_index=BottomLoading.getPageCount();

                        templeteHtml(data);
                        lazyLoad();

                    }
                });
                hideLoad();
            }
            else{
                Common.goLoginPageAction(data.error_code);
                alert(data.error_msg);
            }
        }
    });
}
function lazyLoad(){
     /*来源判断显示*/
    addWechatSource();
    echo.init({
      offset:0,//距离底部多少开始加载
      throttle: 0,//多少秒后加载
      callback:function(ele){
        $(ele).css("opacity",1).css("padding-bottom",0);
      }
    });
}
hideLoad();
function hideLoad(){
    if($(window).height()-$(".container").outerHeight()>=0){
        $("#bottomLoading").hide();
    }
}
function templeteHtml(data){
    console.log(data);
    var source = '{{each order_list as value i}}\
                        {{if value.pay_status!=9}}\
                        <li class="margin_bottom" data-orderid="{{value.id}}">\
                            <div class="flex white_bg padding24 title">\
                                <div class="left flex_item">订单号：{{value.number}}</div>\
                                <div class="right">\
                                    {{if value.pay_status==7}}\
                                    <a class="arrowRight yellow" href="detail.html?id={{value.id}}">等待支付</a>\
                                    {{/if}}\
                                    {{if value.pay_status==8}}\
                                    <a class="arrowRight blue" href="detail.html?id={{value.id}}">已支付</a>\
                                    {{/if}}\
                                    {{if value.pay_status==9}}\
                                    <a class="arrowRight blue" href="detail.html?id={{value.id}}">已关闭</a>\
                                    {{/if}}\
                                </div>\
                            </div>\
                            {{each value.order_items as value1 i1}}\
                            <div class="item" data-id="{{value1.id}}" data-itemnumber="{{value1.item_number}}">\
                                <a class="flex pro_wrap" href="detail.html?id={{value.id}}">\
                                    <div class="box box_center lazy_warp img_wrap">\
                                    <img data-echo="{{value1.image}}">\
                                    </div>\
                                    <div class="flex_item">\
                                        <h1>{{value1.product_name}}</h1>\
                                        <h2>{{value1.sku_name}}</h2>\
                                        {{if !istmall(value.number)}}\
                                        <h3>\
                                            <time class="m_r_20">{{value1.go_time}}</time>\
                                            {{if !trueorfalse(value1.sale_num)}}\
                                            <span class="m_r_20">成人:{{value1.adult_num}}</span>\
                                            <span class="m_r_20">儿童:{{value1.children_num}}</span>\
                                            <span class="m_r_20">婴儿:{{value1.baby_num}}</span>\
                                            {{else}}\
                                            <span class="m_r_20">数量:{{value1.sale_num}}</span>\
                                            {{/if}}\
                                        </h3>\
                                        {{/if}}\
                                    </div>\
                                </a>\
                                {{if value1.is_complete!="-1"}}\
                                <div class="white_bg pro_bottom">\
                                    {{if value1.is_complete!="-1"}}\
                                        {{if !trueorfalse(value1.is_go)}}\
                                            {{if !trueorfalse(value1.is_complete)}}\
                                                <a class="label yellow" href="{{tMiddle(value1.id,value.id,value1.is_contact_complete,value1.is_ticket)}}">填写出行信息</a>\
                                            {{/if}}\
                                        {{/if}}\
                                        {{if trueorfalse(value1.is_complete)}}\
                                            <a href="{{see_info(value1.id)}}" class="label yellow">查看出行信息</a>\
                                        {{/if}}\
                                    {{/if}}\
                                    {{if trueorfalse(value1.is_confirm)}}\
                                    <a href="{{value1.confirm_url}}" class="label yellow">确认函</a>\
                                    {{/if}}\
                                </div>\
                                {{/if}}\
                            </div>\
                            {{/each}}\
                        </li>\
                        {{/if}}\
                        {{/each}}';
        var render = template.compile(source);
        var html = render(data);
        $("#list_all .item_list ul").append(html);
}
template.helper('trueorfalse', function(val){
    if(parseInt(val)==0){
        return false;
    }
    return true;
});
template.helper('returr01', function(val){
    if(parseInt(val)==0){
        return 0;
    }
    return 1;
})

/*template.helper('pay_status_a', function(zi,mu){
    if(window.localStorage.getItem("userInfo")){
        var u=JSON.parse(window.localStorage.getItem("userInfo"));
    }
    //http://192.168.1.5:8098/index.php?from=web&order_id=6155&user_id=17&token=VkRFME5UWXpNRE14TWpBPQ&device_id=0681901456303104
    var str=Common.fill_ip+"/index.php?from=web&order_id="+zi+"&user_id="+Common.config.user_id+"&token="+u.token+"&device_id="+Common.config.device_id+"&back_url="+window.location.origin+'/app/views/taobao/detail.html?id='+mu;
    return str;
});*/

template.helper('istmall', function(pre){
    var n=pre.toLowerCase();
    if(n.indexOf('t')>-1){
        return true;
    }
    return false;
});
template.helper('int_num', function(val){
    return parseInt(val);
});

