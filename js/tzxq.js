/**
 * Created by Walker on 2018/3/19.
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
    $.config = {router: false};
  var pubUrl = sessionStorage.getItem("puburl");
  var picUrl=sessionStorage.getItem("picurl");
  $(function(){
    var id="";
    var memberId="";
    var landlord=0;
    var timeSort="ASC";
    var M={
      init:function(){
        this.nfiniteRolling();
        this.toggleGongneng();
        id=this.getQueryString("id");
        articleId=id;
        memberId=this.getQueryString("memberId");
        var par={id:id,memberId:memberId};
        var url =pubUrl+"/app/article/recommend/detail";
        this.requestData(url,par,"video");
        var commentPar={articleId:articleId,landlord:landlord,timeSort:timeSort};
        var commentUrl=pubUrl+"/app/comment/commentList";
        this.requestData(commentUrl,commentPar,"comment");
        this.lookLandLord();
        this.timeSort();
        this.collection();

        var isFavorUrl = pubUrl+"/app/favor/isFavor";
        var isFavorPar = {memberId:memberId,articleId:articleId};
        this.requestData(isFavorUrl,isFavorPar);
      },
      //无限滚动
      nfiniteRolling :function(){
        $(document).on("pageInit", "#page-ptr", function(e, id, page) {

          var loading = false;
          // var maxItems = 100;
          $(page).on('infinite', function() {
            // 如果正在加载，则退出
            if (loading) return;
            // 设置flag
            loading = true;
            id=this.getQueryString("id");

            var tjpar ={articleId:articleId,landlord:landlord,timeSort:timeSort};
            console.log(tjpar);
            var url=pubUrl+'/app/comment/commentList';

            // 模拟1s的加载过程
            pageNo++;//andiqu
            $.ajax({
              type: 'post',
              data:tjpar,
              url:url,
              dataType: 'json',
              timeout: 3000,
              success: function(data){
                M.render(data);
                loading = false;
                $.hidePreloader();
                if (data.data.length==0){
                  // 加载完毕，则注销无限加载事件，以防不必要的加载
                  $.detachInfiniteScroll($('.listblock'));

                  // 删除加载提示符
                  $('.infinite-scroll-preloader').remove();
                  return;
                }
                $.refreshScroller();
              },
              error: function(xhr, type){
                  $.toast('服务器开小差了～');
                  return false;
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
      requestData: function (url,parameter,str) {

        $.ajax({
          type: 'post',
          url: url,
          data: parameter,
          dataType: 'json',
          timeout: 3000,
          success: function (data) {
            if(str =="video"){
              M.render(data,"video");
              M.render(data,"bottom");
              M.dianZan();
            }else if(str == "comment"){
              M.render(data,"comment");
            }
            console.log(data);
            $.hidePreloader();
          },
          error: function (xhr, type) {
              $.toast('服务器开小差了～');
              return false;
          }
        })
      },
      //渲染模板
      render: function (data,str) {
        data.puburl = pubUrl;
        data.picurl = picUrl;
        if(str=="video"){
          $(".enwrap").html(template('enwrapTpl',data));
          $(".iconright").html(template('bottomTpl',data));
        }else if(str == "comment"){
          $(".full-reply").html(template('commentTpl',data));
        }
      },
      //只看楼主
      lookLandLord:function(){
        $(".looklandlord").on("click",function(){
          landlord=1;
          timeSort="DESC";
          articleId= M.getQueryString("id");
          var commentPar={articleId:articleId,landlord:landlord,timeSort:timeSort};
          var commentUrl=pubUrl+"/app/comment/commentList";
          M.requestData(commentUrl,commentPar,"comment");
        })
      },
      //时间排序
      timeSort:function(){
        $(".timepaixu").on("click",function(){
          landlord=1;
          if(timeSort =="ASC"){
            timeSort="DESC";
          }else if(timeSort =="DESC"){
            timeSort="ASC";
          }
          articleId= M.getQueryString("id");
          var commentPar={articleId:articleId,landlord:landlord,timeSort:timeSort};
          var commentUrl=pubUrl+"/app/comment/commentList";
          M.requestData(commentUrl,commentPar,"comment");

        })
      },

      //收藏
      collection:function(){
      $(".shoucang").on('click',function(){
        articleId= M.getQueryString("id");
        var memberId =localStorage.getItem("memberId");
        var title = $(".c-title span").val();
        var videoUrl=$("source").attr("src");
        var type =3;
        var par={articleId:articleId,memberId:memberId,title:title,videoUrl:videoUrl,type:type};
        var url = pubUrl+"/app/favor/save";
        $.ajax({
          type: 'post',
          url: url,
          data: par,
          dataType: 'json',
          timeout: 3000,
          success: function (data) {
            if(data.code == 1){
              $(".shoucang") .find("img").attr("src","images/all_icon_Collection_press.png");
            }else{
              $(".shoucang") .find("img").attr("src","images/all_icon_Collection_normal.png");
            }
            console.log(data);
            $.hidePreloader();
          },
          error: function (xhr, type) {
              $.toast('服务器开小差了～');
              return false;
          }
        })
      })
      },

      //点赞
      dianZan:function(){
        $(".fabulous").on('click',function(){
          articleId= M.getQueryString("id");
          var memberId =localStorage.getItem("memberId");
          articleId= M.getQueryString("id");
          var par={articleId:articleId,memberId:memberId};
          var url = pubUrl+"/app/support/isFaver";
          var num=_this.find("span").text();
          $.ajax({
            type: 'post',
            url: url,
            data: par,
            dataType: 'json',
            timeout: 3000,
            success: function (data) {
              if(data.code ==0){
                _this.find("img").attr("src","images/all_icon_Good_press.png");
                _this.find("span").text(++num);
              }else if(data.code == 1){
                _this.find("img").attr("src","images/all_icon_Good_normal.png");
                _this.find("span").text(--num);
              }
              console.log(data);
              $.hidePreloader();
            },
            error: function (xhr, type) {
                $.toast('服务器开小差了～');
                return false;
            }
          })


        })
      }

    };

   M.init();

    $.init();
  })

})

