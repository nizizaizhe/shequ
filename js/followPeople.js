/**
 * Created by Walker on 2018/3/10.
 */
require.config({
  baseUrl: 'js',
  paths: {
    'Zepto':['lib/Zepto.min'],
    'sm':['lib/sm.min'],
    'template': 'lib/template.min',
    'config': 'lib/config'
  },
  shim: {
    'Zepto':{exports:'Zepto'},
    'config':{deps:['Zepto']},
    'sm':{
      deps: ['Zepto']
    }
  }
});
require(['Zepto','template','sm','config'], function($,template) {
  var pubUrl = localStorage.getItem("puburl");
  var picUrl=localStorage.getItem("picurl");
  $(function(){
    var pageSize =10;
    var pageNo = 1;
    var groupId="";
    var loading =false;
    var par ='';
    var url='';
    var M={
        totalCount:0,
      init:function(){
        groupId = this.getQueryString("id");
        url=pubUrl+"/app/follow/followList";
        par = {pageNo:pageNo,pageSize:pageSize,groupId:groupId};
        this.clickFn();
        this.requestData(url,par,'init');
      },

      clickFn:function(){
          //刷新
          // 添加'refresh'监听器
          $(document).on('refresh', '.pull-to-refresh-content',function(e) {
               par.pageNo=1;
              // 模拟2s的加载过程
              setTimeout(function() {
                  M.requestData(url,par,'init');//评论
                  // 加载完毕需要重置
                  $.pullToRefreshDone('.pull-to-refresh-content');
              }, 1000);
          });
          // 注册'infinite'事件处理函数
          $(document).on('infinite', '.infinite-scroll',function() {
              // 如果正在加载，则退出
              if (loading) return;
              // 设置flag
              loading = true;

              // 模拟1s的加载过程
              setTimeout(function() {
                  // 重置加载flag
                  loading = false;
                  if (pageSize*pageNo >= M.totalCount){
                      // 加载完毕，则注销无限加载事件，以防不必要的加载
                      $.detachInfiniteScroll($('.infinite-scroll'));
                      // 删除加载提示符
                      $('.infinite-scroll-preloader').remove();

                      $('.mypreloader').css('display','block');//显示加载到底
                      return;
                  }
                  // 添加新条目
                  pageNo++;
                  par.pageNo=pageNo;
                  M.requestData(url,par,'scrool');//评论
                  //容器发生改变,如果是js滚动，需要刷新滚动
                  $.refreshScroller();
              }, 500);
          });
      },
      //请求数据
      requestData: function (url, parameter,str) {
        $.ajax({
          type: 'post',
          url: url,
          data: parameter,
          dataType: 'json',
          timeout: 3000,
          success: function (data) {
            M.totalCount=data.page.totalCount;
              M.render(data,str);
            $.hidePreloader();
          },
          error: function (xhr, type) {
            console.log(xhr);
            $.toast("网络异常");
          }
        })

      },
      //渲染模板
      render: function (data,isscroll) {
        data.puburl = pubUrl;
        data.picurl = picUrl;
        if(isscroll=='init'){

            $(".list-container").html(template("followPeopleTpl",data));
            if(data.data.length<=10){
                $('.infinite-scroll-preloader').css('display','none');
            }
        }else{

            $(".list-container").append(template("followPeopleTpl",data));

        }

      },
      //获取参数
      getQueryString:function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]); return null;
      }
    };
    $.init();
    M.init();
  })

})
