/**
 * Created by Walker on 2018/3/21.
 */
require.config({
  baseUrl: 'js',
  paths: {
    'Zepto':['lib/Zepto.min'],
    'touch':'lib/touch',
    'sm':['lib/sm.min'],
    'template': 'lib/template.min',
    'config': 'lib/config'
  },
  shim: {
    'Zepto':{exports:'Zepto'},
    'config':{deps:['Zepto']},
    'touch':{deps:['Zepto']},
    'sm':{
      deps: ['Zepto']
    }
  }
});
require(['Zepto','template','touch','sm','config'], function($,template) {
  var cknum = 1;
  var pubUrl='';
  var picUrl='';
  var videoUrl='';
    template.helper('getPicture',function(str){
        var arr=str.split(";");
        return arr[0];
    });
  $(function(){
    var loading = false;
    var pageNo=1;
    var pageSize=10;
    var id="";
    var timeSort="ASC";
      var commentPar='';//评论列表参数
      var commentUrl='';//评论列表接口
    pubUrl = localStorage.getItem("puburl");
    picUrl=localStorage.getItem("picurl");
    videoUrl = localStorage.getItem("videourl");
    var M={
          strToken:'',
          strTitle:'',//帖子标题 andiqu
          articleId:'',//帖子id
         memberId:'',//用户id,自定义
        userMemberId:'',//发帖人id
        commentId:'',//
        totalCount:0,//评论总量
        landlord:0,//是否楼主
        postType:0, //postType： 发布类型，1.纯图片，2.纯视频，3.纯文字，4.文字加图片，5.文字加视频
        init:function(i){
          M.strToken =localStorage.getItem("token") || null;
          id = this.getQueryString("id") || '';//帖子id
          M.articleId=id;
          M.memberId=localStorage.getItem('memberId');//用户
          if(!M.articleId ){
              $.toast('帖子id不能为空');
              return;
          }
          M.userMemberId=this.getQueryString("memberId") || null;//发帖人会员id
        //判断图片/视频/图文
        var par={id:id,memberId:M.memberId};//用户id
        var url =pubUrl+"/app/article/recommend/detail";// 帖子信息接口： id: 帖子id  memberId:发帖人id
        this.requestData(url,par,"video");//视频

         /*评论列表接口：app/comment/commentList
             articleId 帖子id
            landlord  是否楼主 0.否1.是
            timeSort  时间排序 ASC:正序 ,DESC:倒序
            pageNo    当前分页数
            pageSize 分页大小
          */
          if(i!=2)return;
        this.newcomments();//初始化评论btn事件
        M.clickFn();
          M.isDisable();
          // //规避初次进入页面卡顿
          // $(".iptReplay").focus();//调用键盘
          // $(".iptReplay").blur();//隐藏键盘
      },
        //判断评论球是否在可视区域，在，显示；不在，隐藏
        isDisable:function(){
            var $content = $('.content');//
            $content.on("scroll",function(){
                var contentHeight = $content.height();//页面content区域的高度:
                var iptReplayOffsetTop = $(".iptReplay").offset().top;//input框距离页面content顶部的距离
                var itemOuterHeight = $(".iptReplay").height();//input元素高度

                if(iptReplayOffsetTop-itemOuterHeight<=contentHeight  && (iptReplayOffsetTop+10)>0){
                    $(".roundBall").css('display','none');
                } else {
                    $(".roundBall").css('display','block');
                }
            })
                //.trigger('scroll');
        },
      clickFn:function(){
        // $(".videoorpic").on("touchmove",function(){
        //     // if(cknum==1){
        //     //   alert(cknum);
        //     //   location.reload();
        //     // }else{

        //     // }
        //     // cknum++;
        //    // var html = $("body").html();
        //    // $("body").html(html);
        //     // if(window.name != "bencalie"){
        //     //     window.name = "bencalie";
        //     //     M.init();
        //     //     //location.reload();
        //     // }else{
        //     //     window.name = "";
        //     //     M.init();
        //     // }
           
        // });
          
         //id={{item.commentId}}&floor={{index+1}}&replyId={{item.id}}
          //回复跳转回复页面
          $("body").on('click','.btnReply',function(e){
              var commentId=$(this).parents('.commentContent').attr('commentId');// 只使用此字段 查看评论详情
              var floor=$(this).parents('.commentContent').find('.before').attr('floor');// 查看评论下的回复详情
              var replyId=$(this).attr('replyId');// 回复id
              var obj={'commentId':commentId,'floor':floor,'memberId': M.fromMemberId,'replyId':replyId};//fromemberID 发帖人
              var strObj=JSON.stringify(obj);
              sessionStorage.setItem('moreSel',strObj);
              window.location.href='replylist.html?moreSel=2';// 查看评论对回复
          });
          //查看更多评论nickname
          $("body").on('click','.btnMore,.nickname',function(e){
              var commentId=$(this).parents('.commentContent').attr('commentId');// 只使用此字段 查看评论详情
              var floor=$(this).parents('.commentContent').find('.before').attr('floor');// 只使用此字段 查看评论详情
             var obj={'commentId':commentId,'floor':floor,'memberId': M.fromMemberId};
            var strObj=JSON.stringify(obj);
              sessionStorage.setItem('moreSel',strObj);
              window.location.href='replylist.html?moreSel=1';//评论
          });
          //评论球事件
          $('.roundBall').click(function () {
             $('.iptReplay').focus();
            // $('.return-box').addClass('centerPostion');

          });
          //只看楼主
          $(".pinglun").on("click",function(){
              var $li=$('.full-reply').find('li');
              if($li.length<1){
                  return false;
              }
              M.landlord=1;
              commentPar.timeSort="DESC";
              commentPar.landlord=1;
              M.requestData(commentUrl,commentPar,"comment");
              if(M.totalCount>0){//只看楼主查询后判断出现沙发or隐藏
                  $('.sofa').addClass('hide');
                  $('.mypreloader').removeClass('hide');
              }else{
                  $('.sofa').removeClass('hide');
                  $('.mypreloader').addClass('hide');
              }
          });
          //按时间排序
          $(".btnTime").on("click",function(){
            var _this=$(this);
              var $li=$('.full-reply').find('li');
              if($li.length<2){
                  return false;
              }
              if(timeSort =="ASC"){
                timeSort="DESC";
                  commentPar.timeSort="DESC";
                  _this.find('label').text('最新');
                  _this.find('img').attr('src','images/re.png');
              }else if(timeSort =="DESC"){
                timeSort="ASC";
                  commentPar.timeSort="ASC";
                  _this.find('label').text('默认');
                _this.find('img').attr('src','images/sort.png');
              }
              M.requestData(commentUrl,commentPar,"comment");
          })
            //点赞
          $('.fabulous').click(function(){
              var _this =$(this);
              if (!M.strToken  || M.strToken=='undefined' || M.strToken=='null') {//未登录
                  location.href = 'login.html';
                  return false;
              }
              var memberId =localStorage.getItem("memberId");

              var par={memberId:memberId,articleId:M.articleId};
              var url = pubUrl+"/app/support/isFaver";
              var num=parseInt(_this.find("span").text());
              $.ajax({
                  type: 'post',
                  url: url,
                  data: par,
                  dataType: 'json',
                  timeout: 3000,
                  success: function (data) {
                      if(data.code ==0){//点赞成功
                          _this.find("img").attr("src","images/all_icon_Good_press.png");
                          _this.find("span").text(++num);
                      }else if(data.code == 1){//取消点赞
                          _this.find("img").attr("src","images/all_icon_Good_normal.png");
                          _this.find("span").text(--num);
                      }else{
                          $.toast('接口错误：'+data.message)
                      }
                  },
                  error: function (xhr, type) {
                    $("body").dalutoast('服务器开小差了～')
                        return false;
                  }
              })
          })

          //收藏
          $('.collection').click(function(){
              var _this =$(this);
              if (!M.strToken  || M.strToken=='undefined' || M.strToken=='null') {//未登录
                  location.href = 'login.html';
                  return false;
              }

              var memberId =localStorage.getItem("memberId");
              var title = $(".picture-Content-header").text();
              var imageUrl =_this.find("img").attr("src");
              var type =1;
              var par={articleId:M.articleId,memberId:memberId};
              var url = pubUrl+"/app/favor/save";
              $.ajax({
                  type: 'post',
                  url: url,
                  data: par,
                  dataType: 'json',
                  timeout: 6000,
                  success: function (data) {
                      if(data.code == 1){//收藏成功
                          _this .find("img").attr("src","images/all_icon_Collection_press.png");
                      }else if(data.code == 2){//取消收藏成功
                          _this .find("img").attr("src","images/all_icon_Collection_normal.png");
                      }
                      else {//接口错误
                          $.toast('接口错误'+data.message);
                      }
                  },
                  error: function (xhr, type) {
                     $("body").dalutoast('服务器开小差了～')
                        return false;
                  }
              })
          });
            //刷新
          // 添加'refresh'监听器
          $(document).on('refresh', '.pull-to-refresh-content',function(e) {
              // 模拟2s的加载过程
              setTimeout(function() {
                  var commentPar={articleId:M.articleId,timeSort:timeSort,pageNo:pageNo,pageSize:pageSize};
                  var commentUrl=pubUrl+"/app/comment/commentList";
                  M.requestData(commentUrl,commentPar,"comment");//评论
                  // 加载完毕需要重置
                  $.pullToRefreshDone('.pull-to-refresh-content');
                  if(M.totalCount>0){//只看楼主查询后判断出现沙发or隐藏
                      $('.sofa').addClass('hide');
                      $('.mypreloader').removeClass('hide');
                  }else{
                      $('.sofa').removeClass('hide');
                      $('.mypreloader').addClass('hide');
                  }
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


            if (pageSize*commentPar.pageNo >= M.totalCount){
              // 加载完毕，则注销无限加载事件，以防不必要的加载
              $.detachInfiniteScroll($('.infinite-scroll'));
              // 删除加载提示符
              $('.infinite-scroll-preloader').remove();
              if(M.totalCount>0){
                  $('.mypreloader').removeClass('hide');//显示加载到底
              }else{
                  $('.sofa').removeClass('hide');
              }


              return;
            }
            // 添加新条目
              commentPar.pageNo++;
            M.requestData(commentUrl,commentPar,"comment",true);

            //容器发生改变,如果是js滚动，需要刷新滚动
            $.refreshScroller();
          }, 500);
        });

      },


      //监听视频播放
      hideTitle:function(){
        var myVideo=document.getElementById("myvedio");

        myVideo.addEventListener('play',function(){

          if(myVideo.paused || myVideo.ended){
            $(".quanzi").removeClass("hide");
          }else{
            $(".quanzi").addClass("hide");
          }
        });

        myVideo.addEventListener('pause',function(){
          if(myVideo.paused || myVideo.ended){
            $(".quanzi").removeClass("hide");
          }else{
            $(".quanzi").addClass("hide");
          }
        });


      },
      //获取参数
      getQueryString:function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]); return null;
      },
      //请求数据
      requestData: function (url,parameter,str,isscroll) {

        $.ajax({
          type: 'post',
          url: url,
          data: parameter,
          dataType: 'json',
          timeout: 3000,
            async:false,
          success: function (data) {
              if(data.code!=0){
                  $.toast('')
                  return false;
              }
              // 重置加载flag
              loading = false;
            if(str ==="video"){
                M.postType=parseInt(data.data.postType);
                M.strTitle=data.data.title;
                M.articleId=data.data.id;
               $('.iptReplay').val('');
                M.render(data,"video");
                commentPar={articleId:M.articleId,landlord:M.landlord,timeSort:timeSort,pageNo:pageNo,pageSize:pageSize};
                commentUrl=pubUrl+"/app/comment/commentList";
                M.requestData(commentUrl,commentPar,"comment");//评论信息初始化

            }else if(str === "comment"){
                //todo默认数据
                M.totalCount=data.page.totalCount;

                M.isLouzhu=data.data.isLouzhu;
              M.render(data,"comment",isscroll);
            //   alert('comment suc')

            }else{

            }
          },
          error: function (xhr, type) {
            $("body").dalutoast('服务器开小差了～')
            return false;
          }
        })
      },
      //渲染模板
      render: function (data,str,isscroll) {
        data.puburl = pubUrl;
        data.picurl = picUrl;

        if(str==="video"){
          var $videoorpic= $(".videoorpic");
            //postType： 发布类型，1.纯图片，2.纯视频，3.纯文字，4.文字加图片，5.文字加视频
            //此处定义不同类型的模版  待做 andiqu
            var arrImg=null;
          switch (M.postType){
              case 1:
                  arrImg=data.data.imageUrl.split(';'); //图片可能多张，以分号分割
                  data.data.arrImg=arrImg;
                 $videoorpic.html(template('picTpl',data));//纯图片
                  break;
              case 2:
                data.videourl = videoUrl;
                 $videoorpic.html(template('videoTpl',data));//
                  break;
              case 3:
                 $videoorpic.html(template('textTpl',data));//
                  break;
              case 4:
                  arrImg=data.data.imageUrl.split(';'); //图片可能多张，以分号分割
                  data.data.arrImg=arrImg;
                 $videoorpic.html(template('picTextTpl',data));//
                  break;
              case 5:
                  data.videourl = videoUrl;
                 $videoorpic.html(template('videoTextTpl',data));//
                  break;
          }
          // $(".iconright").html(template('bottomTpl',data));//底部
        }else if(str === "comment"){
          if(isscroll){
                $(".full-reply").append(template('commentTpl',data));
          }else{
              $(".full-reply").html(template('commentTpl',data));//评论模版
          }

        }
      },
      //评论
      newcomments:function(){



          //btnSend 发送
          $(".fsBtn").tap(function(e){

              if(!M.strToken){
                  setTimeout(function () {
                      window.location.href='login.html';
                      return false;
                  },2000);
                    $.toast('暂未登录，请先登录');
              }else{
                  var searchName = $('.iptReplay').val();
                 // alert(searchName);
                  if(searchName===''){
                      $.toast('请输入内容111');
                      return false;
                  }
                  M.sendFunc();
              }
          }),
          $("iptReplay").on('focus',function(e){
                $(this).val('')


          });
        $("iptReplay").on('keyup',function(e){
          var keycode = e.keyCode;
          var searchName = $(this).val();
          if (keycode === 13) {
              if(!M.strToken){
                  setTimeout(function () {
                      window.location.href='login.html';
                      return false;
                  },2000);
                  $.toast('暂未登录，请先登录');
              }else{
                  if(searchName===''){
                      $.toast('请输入内容key13');
                      return false;
                  }
                  M.sendFunc();
              }

          }
        })
      },
        sendFunc:function(){
            var articleId = M.articleId;//帖子ID
            var fromMemberId= M.userMemberId;//发帖人ID
            var strMemberId=M.memberId;//评论人ID
            var content=$('#return-box').val();//评论内容
            var type ='1';//类型1 回复我的帖子，2 回复我的回复，3 回复我的评论 （ 此功能目前只有回复帖子： 1）
            var parameter={'articleId':articleId,'memberId':strMemberId,'fromMemberId':fromMemberId,'content':content,'type':type,'fromContent':M.strTitle};
            M.sendCommentAjax(parameter);
        },
      //发送ajax
      sendCommentAjax:function(parameter){
          $.ajax({
              type: 'post',
              url: pubUrl+'/app/acticleComments/save',
              data: parameter,
              dataType: 'json',
              timeout: 3000,
              async:false,
              success: function (data) {
                if(data.code==0){
                  $('.sofa').addClass('hide');
                  $('.iptReplay').val('');
                  $('.iptReplay').blur();
                  M.requestData(commentUrl,commentPar,"comment");//评论list
                }else{
                  $.toast('acticleComments/save：接口错误')
                }
                  
              },
              error: function (xhr, type) {
                  $.toast('服务器开小差了～');
                  return false;
              }
          })
      },
    };
    // if(window.name != "bencalie"){
    //     window.name = "bencalie";
    //     M.init();
    // }
    // if(window.name == "bencalie"){
    //     window.name = "";
    //     M.init(2);
    // }
    M.init();
    var tt = setTimeout(function(){
        M.init(2);
        clearTimeout(tt);
    },500)
   // M.init();
    $.init();
  })

})
