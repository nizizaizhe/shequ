/**
 * Created by Walker on 2018/3/15.
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

    var M= {
        pageNo:1,
        pageSize:10,
        groupId:0,
        memberId:0,
        noticeUrl: pubUrl + "/app/circle/groupNotice",
        detailUrl:pubUrl + "/app/circle/detail",
        token:'',
        followFlag:2,
       init: function () {
        M.groupId =parseInt(this.getQueryString("id"));
        M.memberId = localStorage.getItem('memberId') || null;
           M.token = localStorage.getItem('token') || null;
        var noticePar = {'groupId': M.groupId};
        this.requestData(M.noticeUrl,noticePar,"gonggao");
        M.initClick();
      },

      initClick:function(){
            //关注/取消关注
          $("body").on('click','.guanzhu',function(){
              var strparam={'groupId':M.groupId,'memberId':M.memberId};;
              if(!M.token){
                  location.href='login.html';
                  return false;
              }
              var strUrl='';
              var strFlag='';
                if(M.followFlag==1){//关注
                    strFlag='cancelGz';
                    strUrl= pubUrl+"/app/follow/delete";
                }else  if(M.followFlag==0){//取消关注
                    strFlag='gz';
                    strUrl= pubUrl+"/app/follow/save";
                }else{
                   $('body').dalutoast('接口返回followFlag错误');
                    return false;
              }
                M.ajaxSend(strUrl,strparam,strFlag);
          })
      },
      ajaxSend:function(strUrl,strparam,strFlag){
          $.ajax({
              type: 'post',
              url: strUrl,
              data: strparam,
              dataType: 'json',
              timeout: 3000,
              success: function (data) {
                  if(data.code===0){
                      if(strFlag==='gz'){
                          M.followFlag=1;
                          $('.guanzhu').text('取消关注');
                      }else {
                        M.followFlag=0;//取消关注成功，followFlag手动更改为未关注（0）
                          $('.guanzhu').text('关注');
                      }
                  }else{
                      $.toast('接口错误：'+data.message)
                  }
                  $.hidePreloader();
              },
              error: function (xhr, type) {
                  $.toast('服务器开小差了～');
                  return false;
              }
          })
      },
      //显示更多
      showMore:function(){
        $(".show-more").hide();
        if ($(".text-body").height() > 62) {
          $(".show-more").show();
          $(".text-body").addClass("clamp");
        }
        $(".show-more").on("click", function () {
          if ($(this).text() == "显示更多") {
            $(this).text("收起");
            $(".text-body").removeClass("clamp");
          } else {
            $(this).text("显示更多");
            $(".text-body").addClass("clamp");
          }

        })
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
            if(str == "gonggao"){
              M.render(data,"gonggao");
              M.showMore();
              var param = {pageNo: M.pageNo, pageSize: M.pageSize, groupId: M.groupId,'memberId':M.memberId };
              M.requestData(M.detailUrl,param,"list");//
            }else{
                M.followFlag=data.data.followFlag;
                M.render(data,"list");
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
        if(str == "gonggao"){
          $(".textbodywrap").append(template("gonggaoTpl",data));
        }else{
          $(".detailswrap").html(template("detailsTpl",data));
        }
    },
      //获取参数
      getQueryString:function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]); return null;
      },

    };
      M.init();
    $.init();

  });

})
