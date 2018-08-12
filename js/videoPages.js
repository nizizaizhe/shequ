"use strict";
require.config({
    baseUrl: 'js',
    paths: {
        'Zepto':['//g.alicdn.com/sj/lib/zepto/zepto.min','lib/Zepto.min'],
        'touch':'lib/touch',
        'sm':['//g.alicdn.com/msui/sm/0.6.2/js/sm.min','lib/sm.min'],
        'template': 'lib/template.min',
        'config':'lib/config',
        'dsBridge':"lib/dsbridge"
    },
    shim: {
        'Zepto':{exports:'Zepto'},
        'touch':{deps:['Zepto']},
        'sm':{
            deps: ['Zepto']
        },
        'config':{deps:['Zepto']}
    }
});

require(['Zepto','template','sm','config','touch','dsBridge'], function($,template) {

  template.helper('getPicture',function(str){
    if(str){
        var arr=str.split(";");
        return arr[0];
    }
  });

  $(function(){
    var pageNo=1;
    var pageSize=10;
    var postType=2;
    var loading = false;
    var pubUrl="";
    var picUrl = "";
    var M={
        strToken:'',//判断是否登录
      init:function(){
        pubUrl = localStorage.getItem("puburl");
        picUrl =localStorage.getItem("picurl");
        M.strToken =localStorage.getItem("token");//登录后有值
        var url=pubUrl+"/app/article/video/list";
        var par={page:1,pageSize:10,postType:2};
        this.requestData(url,par);
        this.dropDown();
        this.nfiniteRolling();
        this.dianZan();
      },
      requestData:function(url,parameter){
        $.ajax({
          type: 'post',
          url:url,
          data:parameter,
          dataType: 'json',
          timeout: 3000,
          success: function(data){
            console.log(data);
            M.render(data);

            M.collection();
          },
          error: function(xhr, type){
              $.toast('服务器开小差了～');
              return false;
          }
        })

      },
      dropDown:function(){
        // 添加'refresh'监听器下拉刷新
        $(document).on('refresh', '.pull-to-refresh-content',function(e) {
                       $.attachInfiniteScroll($(".infinite-scroll"));
                       var url=pubUrl+"/app/article/video/list";
                       var par={page:1,pageSize:10,postType:2};
                       setTimeout(function(){
                                  $.pullToRefreshDone('.pull-to-refresh-content');
                                  M.requestData(url,par);
                                  },1000);
                       });
      },
      //无限滚动
      nfiniteRolling :function(){
        $(document).on('infinite', '.infinite-scroll',function(){
            $(".infinite-scroll-preloader").removeClass("hide");
            if (loading) return;
            loading = true;
            pageNo++;
            var url=pubUrl+"/app/article/video/list";
            var tjpar ={pageNo:pageNo,pageSize:pageSize,postType:postType};
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
                  $(".mypreloader").removeClass("hide");
                  return;
                }
                $.refreshScroller();
              },
              error: function(xhr, type){

              }
          });
        });
      },

      //渲染模板
      render:function(data,isscroll){
          data.puburl=pubUrl;
          data.picurl=picUrl;
          var strAvatar=data.avatar;
          $.map(data.data,function (item,index) {
              item.thumbnail=picUrl+item.thumbnail;
              var strAvatar=data.avatar;
              item.avatar=picUrl+item.avatar;
              return data.data;
          })//andiqu
        if(isscroll){
          $(".list-block").append(template("videoTpl",data));
        }else{
          $(".list-block").html(template("videoTpl",data));
        }

      },
       //收藏
      collection:function(){
        $(".collection").on('click',function(){
          var _this =$(this);
          var articleId= _this.attr("articleId");
          var memberId =localStorage.getItem("memberId");
          var par={articleId:articleId,memberId:memberId};
          var url = pubUrl+"/app/favor/save";

            if (!M.strToken  || M.strToken=='undefined' || M.strToken=='null') {//未登录
                location.href = 'login.html';
                return false;
            }else{
              $.ajax({
                type: 'post',
                url: url,
                data: par,
                dataType: 'json',
                timeout: 3000,
                success: function (data) {
                  if(data.code == 1){
                    _this .find("img").attr("src","images/all_icon_Collection_press.png");
                  }else{
                    _this .find("img").attr("src","images/all_icon_Collection_normal.png");
                  }
                },
                error: function (xhr, type) {
                    $.toast('服务器开小差了～');
                    return false;
                }
              })
          }
        });
      },

      //点赞
      dianZan:function(){
        $("body").on('click','.fabulous',function(){
          var _this =$(this);
          var memberId =localStorage.getItem("memberId");
          var articleId= _this.attr("id");
          var par={memberId:memberId,articleId:articleId};
          var url = pubUrl+"/app/support/isFaver";
          var num=_this.find("span").text();
            if (!M.strToken  || M.strToken=='undefined' || M.strToken=='null') {//未登录
                location.href = 'login.html';
                return false;
            }else{
                $.ajax({
                type: 'post',
                url: url,
                data: par,
                dataType: 'json',
                timeout: 6000,
                success: function (data) {
                  if(data.code ==0){
                    _this.find("img").attr("src","images/all_icon_Good_press.png");
                    _this.find("span").text(++num);
                  }else if(data.code == 1){
                    _this.find("img").attr("src","images/all_icon_Good_normal.png");
                    _this.find("span").text(--num);
                  }
                  console.log(data);
                },
                error: function (xhr, type) {
                    $.toast('服务器开小差了～');
                    return false;
                }
              })
          }       
        })
      }
    };



      function testInit(i){
          if(i==1){
              dsBridge.call("video.getUserInfo",{},function(data){
                 //alert(JSON.stringify(data));
                  if(data.memberid==""||data.memberid==null||data.memberid=="null"||data.memberid==undefined||data.memberid=="undefined"){
                      data.memberid = "";
                  }
                  if(data.userId==""||data.userId==null||data.userId=="null"||data.userId==undefined||data.userId=="undefined"){
                      data.userId="";
                  }
                  if(data.token==""||data.token==null||data.token=="null"||data.token==undefined||data.token=="undefined"){
                      data.token="";
                  }
                  localStorage.setItem('memberId',data.memberid);
                  localStorage.setItem('userId',data.userId);
                  localStorage.setItem('token',data.token);
                  sessionStorage.setItem('fromPage',"video");
                  M.init();
              });
          }else{
              M.init();
          }

      };
      testInit(1);//1 发布  0本地测试

      $.init();
  })
})
