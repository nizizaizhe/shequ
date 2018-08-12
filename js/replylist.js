/**
 * Created by Walker on 2018/3/23.
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
    var picUrl=localStorage.getItem("picurl");
  $(function(){
    var M={
        url:'',
        pageNo:1,
        pageSize:20,
        floor:0,//楼层
        articleId:0, //帖子ID
        replyType:1,//回复类型
        commentId:0,//评论的id
        lzMemberId:'',//楼主id
        memberId:0,//回复用户的id
        replyMsg:"",//回复的内容
        fromUserId:'',//回复人用户id
        replyId:'',//回复记录id
        toUserId:0,//被回复人用户ID
        fromUserMsg:'',//被回复的内容
        isLouzhu:0,
        strToken:'',
        // louzhuId:'',
        // louzhuMsg:'',
      init:function(){
          M.strToken= localStorage.getItem("token");
            M.url= localStorage.getItem("puburl") ;
          var moreSel= JSON.parse(sessionStorage.getItem('moreSel'));
          if( moreSel.commentId===0){
              $.toast('页面跳转时，接口传参错误');
              return false;
          }

          M.commentId=moreSel.commentId;
          M.floor =moreSel.floor;
          M.lzMemberId = moreSel.memberId;//发帖人id即楼主
          var strMoreSel=M.getQueryString("moreSel");
            //  判断回复 还是评论
          if(strMoreSel =='2'){//点击评论下的回复跳转
             // M.replyType=2;
              M.replyId =moreSel.replyId;
          }else  if(strMoreSel =='1'){//走查看更多或点击评论跳转
              //M.replyType=1;
          }
          this.requestData();//发起ajax 查看详情
          M.clickFn();
        this.nfiniteRolling();
        this.toggleGongneng();
      },
        //获取参数
        getQueryString:function (name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
            var r = window.location.search.substr(1).match(reg);
            if (r != null) return unescape(r[2]); return null;
        },

        //初始化页面事件
        clickFn:function(){

            //对回复内容进行回复
            $("body").on('click','.concreteContent',function(e){
                M.toUserId= $(this).attr('fromUserId');//初始化出来的回复人变成被回复人
                M.fromUserMsg= $(this).attr('replyMsg');//被回复内容
               var fromMemberName= $(this).attr('fromMemberName');
               M.replyType=2;
               $('.iptReplay').focus().attr('placeholder','回复@'+fromMemberName);
            }),
            $("body").on('focus','.iptReplay',function(e){
                $(this).val('');
            });
            //btnSend 发送
            $("body").on('click','.btnSend',function(e){
                if(!M.strToken || M.strToken=='undefined' || M.strToken=='null'){
                    setTimeout(function () {
                        window.location.href='login.html';
                        return false;
                    },2000);
                    $.toast('暂未登录，请先登录');
                }else{
                    var searchName = $('.iptReplay').val();
                    if(searchName===''){
                        $.toast('请输入内容');
                        return false;
                    }
                    M.sendFunc();
                }

            }),

            //回车键
            $("body").on('keyup','.iptReplay',function(e){

                var keycode = e.keyCode;
                if (keycode === 13) {
                    if(!M.strToken || M.strToken=='undefined' || M.strToken=='null'){
                        setTimeout(function () {
                            window.location.href='login.html';
                            return false;
                        },2000);
                        $.toast('暂未登录，请先登录');
                    }else{
                        var searchName = $(this).val();
                        if(searchName===''){
                            $.toast('请输入内容');
                            return false;
                        }
                        M.sendFunc();
                    }

                }

            })
        },
        sendFunc:function(){
            /*  评论回复接口http://10.10.30.210/app/acticleRelys/save参数
                        commentId //评论ID
                      //  fromUserId// 回复人用户ID
                       // toUserId//被回复人用户ID
                     //   replyMsg//回复内容
                        replyType//回复类型1 评论 2 回复
                      //  articleId//帖子ID
                      //  fromUserMsg//被回复的内容
                        memberId //楼主ID
                    */


            M.fromUserId= localStorage.getItem("memberId");//评论人ID:当前登录人
            //M.fromUserId 渲染dom时，此接口即被回复人id
            M.replyMsg = $('.iptReplay').val();//回复的内容
            var parameter={'commentId':M.commentId,'articleId':M.articleId,'memberId': M.lzMemberId,'fromUserId':M.fromUserId,'toUserId':M.toUserId,'replyMsg':M.replyMsg,'replyType':M.replyType,'fromUserMsg':M.fromUserMsg}
            M.sendComment(parameter);
        },
        //对回复进行回复：发送ajax
        sendComment:function(parameter){
            //   var strUrl='http://10.10.30.210:8080';
            $.ajax({
                type: 'post',
                url: M.url+'/app/acticleRelys/save',
                data: parameter,
                dataType: 'json',
                timeout: 3000,
                async:false,
                success: function (data) {
                    $.toast('回复成功');
                    $('.iptReplay').val('').attr('placeholder','槽点太多,来BB两句吧~');
                      //重置为对楼主回复
                      // M.toUserId= M.louzhuId;
                      // M.fromUserMsg= M.louzhuMsg;
                      // M.replyType=1; 
                      M.requestData();//初始化回复列表信息
                },
                error: function (xhr, type) {
                    $.toast('服务器开小差了～');
                    return false;
                }
            })
        },
        //请求数据
        requestData: function () {
            var objData={'commentId':M.commentId,'pageNo':M.pageNo,'pageSize':M.pageSize};
            if(M.replyId !='' ){//获取回复记录列表时使用
                objData.replyId=M.replyId;
            }
            var  strUrl=M.url+'/app/comment/detail';
            $.ajax({
                type: 'post',
                url:strUrl,
                data: objData,
                dataType: 'json',
                timeout: 3000,
                success: function (resp) {
                    resp.data.floor=M.floor;
                    //初始化时评论信息默认为被评论对象
                    M.articleId=resp.data.articleId;//帖子id articleId
                    //M.louzhuId=resp.data.memberId;//楼主的id
                    M.toUserId=resp.data.memberId;//被评论人id
                    //M.louzhuMsg=resp.data.content;//楼主的内容
                    M.fromUserMsg=resp.data.content;//被回复内容
                    M.replyType=1; 
                    M.render(resp.data,0);//评论对象信息
                    loading = false;
                    $.hidePreloader();
                    $.refreshScroller();
                },
                error: function (xhr, type) {
                    $.toast('服务器开小差了～');
                    return false;
                }
            })
        },
        //渲染模板
        render: function (data,i) {
            data.picurl = picUrl;
            $(".postContent").html(template('commentTpl',data));//评论信息模版
           $(".full-reply").html(template('replyTpl',data));//评论回复模版

        },

      //无限滚动
      nfiniteRolling :function(){
        $(document).on("pageInit", "#page-infinite-scroll-bottom", function(e, id, page) {
            var loading = false;
            // 每次加载添加多少条目
          $(page).on('infinite', function() {
              // 如果正在加载，则退出
              if (loading) return;
              // 设置flag
              loading = true;
           /*   M.pageNo++;*/
            M.requestData();//发起ajax
          });
        });
      },
      //隐藏显示切换
      toggleGongneng:function(){
        $('.function-list ').hide();
        $(".functional-keys").on('click',function(){
          $('.function-list ').toggle();
        })
      }
    };

    M.init();

    $.init();
  })

})

