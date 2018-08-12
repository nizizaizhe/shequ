/**
 * Created by Walker on 2018/3/21.
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
    var pubUrl = localStorage.getItem("puburl");
    var picUrl=localStorage.getItem("picurl");
    template.helper('getPicture',function(str){
        var arr=str.split(";");
        return arr[0];
    });
    $(function(){
        var id="";
        // var memberId="";
        //var landlord=1; //是否楼主
        var timeSort="ASC";

        var M={
            strTitle:'',//帖子标题 andiqu
            memberId:'',
            commentId:'',
            articleId:'',
            postType:0, //postType： 发布类型，1.纯图片，2.纯视频，3.纯文字，4.文字加图片，5.文字加视频
            init:function(){
                

                M.clickFn();

            },
            clickFn:function(){
                /* id={{item.commentId}}&floor={{index+1}}&replyId={{item.id}}*/
                $("body").on('click','.btnReply',function(e){

                    var commentId=$(this).parents('.commentContent').attr('commentId');// 只使用此字段 查看评论详情
                    var floor=$(this).parents('.commentContent').find('.before').attr('floor');// 查看评论下的回复详情
                    var replyId=$(this).attr('replyId');// 回复id

                    var obj={'commentId':commentId,'floor':floor,'replyId':replyId};
                    var strObj=JSON.stringify(obj);
                    sessionStorage.setItem('moreSel',strObj);
                    window.location.href='replylist.html?moreSel=2';// 查看评论对回复
                });
                //查看更多评论
                $("body").on('click','.btnMore',function(e){

                    var commentId=$(this).parents('.commentContent').attr('commentId');// 只使用此字段 查看评论详情

                    var floor=$(this).parents('.commentContent').find('.before').attr('floor');// 只使用此字段 查看评论详情

                    var obj={'commentId':commentId,'floor':floor};
                    var strObj=JSON.stringify(obj);
                    sessionStorage.setItem('moreSel',strObj);
                    window.location.href='replylist.html?moreSel=1';
                });
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
                        var tjpar ="";
                        var url="";

                        if(tab === "tab1"){
                            tjpar={pageNo:pg,pageSize:ps};
                            url = pubUrl+'/app/article/recommend/list';
                        }else if(tab ==="tab2"){
                            var memberId=localStorage.getItem("memberId");
                            tjpar={pageNo:pg,pageSize:ps,memberId:memberId};
                            url = pubUrl+'/app/follow/list';
                        }else if(tab === "tab3"){
                            tjpar={pageNo:pg,pageSize:ps};
                            url = pubUrl+'/app/article/hot/list';
                        }
                        // 模拟1s的加载过程
                        pg++;//andiqu
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
                                if (data.data.length==0) {
                                    // 加载完毕，则注销无限加载事件，以防不必要的加载
                                    $.detachInfiniteScroll($('.infinite-scroll'));
                                    $.detachInfiniteScroll($('#card-content2'));
                                    $.detachInfiniteScroll($('#card-content3'));
                                    // 删除加载提示符
                                    $('.infinite-scroll-preloader').remove();
                                    return;
                                }
                                $.refreshScroller();
                            },
                            error: function(xhr, type){
                                console.log(xhr);
                                // $.hidePreloader();
                                $.toast("网络异常");
                            }
                        })

                    });
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
            //隐藏显示切换
            toggleGongneng:function(){
                $('.function-list ').hide();
                $(".functional-keys").on('click',function(){
                    $('.function-list ').toggle();
                })
            },
            /*//显示更多
            showMore:function(){
              if($(".vd-twoLevelList li").length>2){
                $(".more-comments").show()
              }else{
                $(".more-comments").hide();
              }
            },*/
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
                    async:true,
                    success: function (data) {

                        if(str ==="video"){
                            M.strTitle=data.data.title;
                            $('.iptReplay').val('');
                            M.render(data,"video");
                            M.render(data,"bottom");

                        }else if(str === "comment"){
                            M.render(data,"comment");
                            M.collection();

                        }



                        console.log(data);
                        $.hidePreloader();
                    },
                    error: function (xhr, type) {
                        console.log(xhr);
                        // $.hidePreloader();
                        $.toast("网络异常");
                    }
                })
            },
            //渲染模板
            render: function (data,str) {
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
                            $videoorpic.html(template('videoTextTpl',data));//
                            break;

                    }

                    $(".iconright").html(template('bottomTpl',data));//底部
                }else if(str === "comment"){
                    $(".full-reply").html(template('commentTpl',data));//评论模版
                }
            },
            //评论
            newcomments:function(){


                    $("body").on('focus','.iptReplay',function(e){
                        alert('focus')
                        $(this).val('');
                        var target = this;
                        // 使用定时器是为了让输入框上滑时更加自然
                        setTimeout(function(){
                            target.scrollIntoView(true);
                        },100);


                    })


                    $("body").on('keyup','.iptReplay',function(e){

                        var keycode = e.keyCode;
                        var searchName = $(this).val();

                        if (keycode === 13) {

                            if(searchName===''){
                                $.toast('请输入内容');
                                return false;
                            }
                            var articleId =  M.getQueryString("id");//帖子ID
                            var memberId= localStorage.getItem("memberId");//评论人ID
                            var fromMemberId =memberId;//发帖人ID
                            var content=$('#return-box').val();//评论内容
                            var type ='1';//类型1 回复我的帖子，2 回复我的回复，3 回复我的评论
                            var   parameter={'articleId':articleId,'memberId':memberId,'fromMemberId':fromMemberId,'content':content,'type':type,'fromContent':M.strTitle}
                            M.sendComment(parameter);
                        }
                    })
            },
            //发送ajax
            sendComment:function(parameter){
                var strUrl='http://192.168.0.102:8888';
                $.ajax({
                    type: 'post',
                    url: strUrl+'/app/acticleComments/save',
                    data: parameter,
                    dataType: 'json',
                    timeout: 3000,
                    async:false,
                    success: function (data) {
                        var articleId =  M.getQueryString("id");//帖子ID
                        var commentPar={articleId:articleId,timeSort:timeSort};
                        var commentUrl=pubUrl+"/app/comment/commentList";
                        M.requestData(commentUrl,commentPar,"comment");//评论
                    },
                    error: function (xhr, type) {
                        console.log(xhr);
                        $.toast("评论接口错误（acticleComments/save）");
                    }
                })
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
                    var _this =$(this);
                    var token = localStorage.getItem("token");
                    if(token == null ||token ==""){
                        window.location.href="login.html";
                    }
                    articleId= M.getQueryString("id");
                    var memberId =localStorage.getItem("memberId");
                    var par={articleId:articleId,memberId:memberId};
                    var url = pubUrl+"/app/favor/save";
                    $.ajax({
                        type: 'post',
                        url: url,
                        data: par,
                        dataType: 'json',
                        timeout: 3000,
                        success: function (data) {
                            if(data.code == 1){
                                _this.find("img").attr("src","images/all_icon_Collection_press.png");
                            }else{
                                _this.find("img").attr("src","images/all_icon_Collection_normal.png");
                            }
                            console.log(data);
                            $.hidePreloader();
                        },
                        error: function (xhr, type) {
                            console.log(xhr);
                            // $.hidePreloader();
                            $.toast("网络异常");
                        }
                    })
                })
            },

        };


        M.init();

        $.init();
    })

})
