/**
 * Created by Walker on 2018/3/12.
 */
"use strict";
require.config({
    baseUrl: 'js',
    paths: {
        'Zepto': ['//g.alicdn.com/sj/lib/zepto/zepto.min', 'lib/Zepto.min'],
        'touch': 'lib/touch',
        'sm': ['//g.alicdn.com/msui/sm/0.6.2/js/sm.min', 'lib/sm.min'],
        'template': 'lib/template.min',
        'config': 'lib/config',
        'dsBridge': "lib/dsbridge"
    },
    shim: {
        'Zepto': {exports: 'Zepto'},
        'touch': {deps: ['Zepto']},
        'sm': {
            deps: ['Zepto']
        },
        'config': {deps: ['Zepto']}
    }
});

require(['Zepto', 'template', 'sm', 'config', 'touch', 'dsBridge'], function ($, template) {


    $(function () {
        var loading = false;
        var pubUrl = localStorage.getItem("puburl");
        var pageNo = 1;
        var pageSize = 10;
        var gzurl = pubUrl + "/app/follow/list";
        var tjurl = pubUrl + "/app/recommend/list";
        var M = {
            memberId: "",
            totalCount:0,//推介圈子总条数
            picUrl: localStorage.getItem("picurl"),
            strToken: '',//判断是否登录
            init: function () {
                pageNo = 1;
                M.strToken = localStorage.getItem("token") || null;//登录后有值
                M.memberId = localStorage.getItem('memberId');
                var gzpar = {pageNo: pageNo, pageSize: 100, memberId: M.memberId};
                var par = {pageNo: pageNo, pageSize: pageSize, memberId: M.memberId};
                if (M.strToken) {// token 有值 ,已登录进入
                    this.requestData(gzurl, gzpar, "gz");//圈子列表
                }
                this.requestData(tjurl, par, "tj");//推介圈子
                M.initClick();
            },
            initClick: function () {
                //刷新
                // 添加'refresh'监听器
                $(document).on('refresh', '.pull-to-refresh-content',function(e) {
                    // 模拟2s的加载过程
                    var t = setTimeout(function() {
                        pageNo = 1;
                        var par = {pageNo: pageNo, pageSize: pageSize, memberId: M.memberId};
                        // if (M.strToken != null) {// token 有值 ,已登录进入
                        //
                        // }
                        M.requestData(gzurl, par, "gz");//圈子列表

                        // 加载完毕需要重置
                        $.pullToRefreshDone('.pull-to-refresh-content');
                        clearTimeout(t);
                    }, 1000);
                });
                // 注册'infinite'事件处理函数
                $(document).on('infinite', '.infinite-scroll',function() {
                    // 如果正在加载，则退出
                    if (loading) return;
                    $('.infinite-scroll-preloader').removeClass('hide');
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
                        var param = {pageNo: pageNo, pageSize: pageSize, memberId: M.memberId};
                        M.requestData(tjurl, param, "tj");//推介圈子
                        //容器发生改变,如果是js滚动，需要刷新滚动
                        $.refreshScroller();
                    }, 500);
                });


                //middle-content
                //跳转圈子详情
                $("body").on('click', '.middle-content', function (e) {
                    var id = $(this).attr('data-id') || null;
                    var followFlag = $(this).attr('followFlag') || null;
                    var qzName = $(this).attr('circleName') || null;
                    if (followFlag == null || id == null || qzName == null) {
                        $.toast('接口参数绑定有问题');
                        return false;
                    }
                    location.href = 'listofCircles.html?id=' + id + '&followFlag=' + followFlag + '&circleName=' + qzName;
                });
                //关注。
                $("body").on('click', '.add-attention', function (e) {
                    var followflag = $(this).prev(".middle-content").attr("followflag");
                    if (followflag == 1) {
                        return false;
                    }
                    if (!M.strToken  || M.strToken=='undefined' || M.strToken=='null') {//未登录
                        window.location.href = "login.html?fromPage=2";
                    } else {
                        $(this).children("img").attr("src", "images/tick@2x.png");
                        var groupId = $(this).prev(".middle-content").attr("data-id");
                        var url = pubUrl + "/app/follow/save";
                        var savepar = {groupId: groupId, memberId: M.memberId};
                        //调用添加关注
                        M.requestData(url, savepar, 'save');
                    }
                })
            },
            // //刷新
            // dropDown: function (data) {
            //     $(document).on('refresh', '.pull-to-refresh-content', function (e) {
            //         var t = setTimeout(function () {
            //             pageNo = 1;
            //             var par = {pageNo: pageNo, pageSize: pageSize, memberId: M.memberId};
            //             if (M.strToken != null) {// token 有值 ,已登录进入
            //                 M.requestData(gzurl, par, "gz");//圈子列表
            //             }
            //             M.requestData(tjurl, par, "tj");//推介圈子
            //             //  M.initClick();
            //             $.pullToRefreshDone('.pull-to-refresh-content');
            //             clearTimeout(t);
            //         }, 1000);
            //     });
            // },

            requestData: function (url, parameter, str) {
                $.ajax({
                    type: 'post',
                    url: url,
                    data: parameter,
                    dataType: 'json',
                    timeout: 6000,
                    success: function (data) {
                        if (!data.data) {
                            return false;
                        }
                        $.map(data.data, function (item, index) {
                            item.logo = M.picUrl + item.logo;

                            if (item.hasOwnProperty('avatar')) {
                                item.avatar = M.picUrl + item.avatar;
                            }
                            return data.data;
                        });
                        M.render(data, str);
                    },
                    error: function (xhr, type) {
                        $.toast('服务器开小差了～');
                        return false;
                    }
                });
            },
            render: function (data, str) {
                var qzName = '';
                $.map(data.data, function (item, index) {
                    data.data[index].qzName = String(encodeURI(item.name));
                    return data.data;
                });
                if (!M.strToken  || M.strToken=='undefined' || M.strToken=='null') {//未登录
                    if (str == "tj") {
                        $(".xia").html(template("tjcircleTpl", data));
                    }
                    data.token = M.strToken;//walker
                    data.data = [];//空数组，展示暂未关注圈子
                    $(".shang").html(template("followTpl", data));

                } else {//登录
                    if (str == "gz") {
                        $(".shang").html(template("followTpl", data));
                    } else if (str == "tj") {
                        $(".xia").html(template("tjcircleTpl", data));
                    } else if (str == "save") {
                        //调用关注接口刷新页面
                        var par = {pageNo: pageNo, pageSize: pageSize, memberId: M.memberId};
                        M.requestData(gzurl, par, "gz");
                    }
                }
            }
        };

               function testInit(i){
            if(i==1){
                dsBridge.call("quanzi.getUserInfo",{},function(data){
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
                    sessionStorage.setItem('fromPage',"quanzi");
                    M.init();
                });
            }else{
                M.init();
            }

        };
        testInit(0);//1 发布  0本地测试
        $.init();
    });
});
