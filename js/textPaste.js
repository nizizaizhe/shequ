/**
 * Created by Walker on 2018/3/18.
 */
/**
 * Created by Walker on 2018/3/17.
 */
/**
 * Created by Walker on 2018/3/17.
 */
/**
 * Created by Walker on 2018/3/10.
 */

require.config({
  baseUrl: 'js',
  paths: {
    'Zepto':['//g.alicdn.com/sj/lib/zepto/zepto.min','lib/Zepto.min'],
    'sm':['//g.alicdn.com/msui/sm/0.6.2/js/sm.min','lib/sm.min'],
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
  var picUrl = localStorage.getItem("picurl");//andiqu
  template.helper('getPicture',function(str){
    var arr=str.split(";");
    return arr[0];
  });

  $(function(){
    var pageNo=1;
    var pageSize=10;
    var postType=3;
    var M={
      init:function(){
        var url=pubUrl+"/app/article/recommend/list";
        var par={pageNo:pageNo,pageSize:pageSize,postType:postType};
        this.requestData(url,par);
        this.dropDown();
        this.nfiniteRolling();
      },
      //下拉刷新
      dropDown :function(data){
        $(document).on('refresh', '.pull-to-refresh-content',function(e) {
          pageNo=1;
          var url = "";
          var par = "";
          var postType=3;
          url=pubUrl+"/app/article/recommend/list";
          par={pageNo:pageNo,pageSize:pageSize,postType:postType};
          M.requestData(url,par);

        });
      },
      //无限滚动
      nfiniteRolling :function(){
        $(document).on("infinite", ".infinite-scroll", function(e, id, page) {
          $(page).on('infinite', function() {
            if (loading) return;
            loading = true;
            pageNo++;
            var tjpar ={pageNo:pageNo,pageSize:pageSize,postType:postType};
            var url=pubUrl+"/app/article/recommend/list";
            $.ajax({
              type: 'post',
              data:tjpar,
              url:url,
              dataType: 'json',
              timeout: 6000,
              success: function(data){
                M.render(data,true);

                loading = false;
                if (data.data.length==0) {
                  // 加载完毕，则注销无限加载事件，以防不必要的加载
                  $.detachInfiniteScroll($('.infinite-scroll'));
                  // 删除加载提示符
                  $('.infinite-scroll-preloader').remove();
                  return;
                }
                $.refreshScroller();
              },
              error: function(xhr, type){
              }
            })

          });
        });
      },
      //隐藏显示切换
      toggleGongneng:function(){
        $('.function-list ').hide();
        $(".functional-keys").on('click',function(){
          $('.function-list ').toggle();
        })
      },
      //获取参数
      getQueryString:function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]); return null;
      },
      //请求数据
      requestData: function (url,parameter) {

        $.ajax({
          type: 'post',
          url: url,
          data: parameter,
          dataType: 'json',
          timeout: 3000,
          success: function (data) {
          M.render(data);
            console.log(data);
            $.hidePreloader();
            $.pullToRefreshDone('.pull-to-refresh-content');
          },
          error: function (xhr, type) {
            console.log(xhr);
            // $.hidePreloader();
            $.toast("网络异常");
          }
        })
      },
      //渲染模板
      render: function(data,isscroll) {
        data.puburl = pubUrl;
        data.picurl = picUrl;
        if(isscroll){
          $(".pastewrap").append(template('postTpl',data));
        }else{
          $(".pastewrap").html(template('postTpl',data));
        }

      },

    }

    M.init();
    $.init();
  })

})
