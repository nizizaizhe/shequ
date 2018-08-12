/**
 * Created by Walker on 2018/3/10.
 */
require.config({
    baseUrl: 'js',
    paths: {
        'Zepto': ['lib/Zepto.min'],
        'touch': 'lib/touch',
        'ani': 'lib/animate',
        'sm': ['lib/sm'],
        'config': 'lib/config',
        'template': 'lib/template.min',
        'dsBridge': "lib/dsbridge"
    },
    shim: {
        'Zepto': {exports: 'Zepto'},
        'touch': {deps: ['Zepto']},
        'config': {deps: ['Zepto']},
        'ani': {deps: ['Zepto']},
        'sm': {
            deps: ['Zepto']
        }
    }
});
require(['Zepto', 'template', 'sm', 'touch', 'ani', 'config', 'dsBridge'], function ($, template) {
    $.config = {router: false};

    template.helper('getPicture', function (str) {
        var arr = str.split(";");
        return arr[0];
    });

    $(function () {
        var loading = false;
        var pubUrl = '';//接口地址
        var picUrl = '';//图片地址
        var videoUrl = '';//视频地址
        //postType： 发布类型，1.纯图片，2.纯视频，3.纯文字，4.文字加图片，5.文字加视频
        var pageNo = 1;
        var pageSize = 10;
        var tab = "tab1";
        var url ='';
        var gzurl = '';
        var gzLoginurl = '';
        var tjurl = '';
        var hoturl ='';//热帖
        var memberId = '';
        var tjpar = "";
        var par = null;
        var M = {
            _scrollOver: false,
            strToken: null,//判断是否登
            gzLoginData: false,//登录状态下， 默认接口（article/follow/list）无数据为false,此时调用接口（/app/follow/list）展示相关tpl;有数据为true时，展示与hot一致的页面结构tpl
            init: function () {
                pubUrl = localStorage.getItem("puburl");//接口地址
                picUrl = localStorage.getItem("picurl");//图片地址
                videoUrl = localStorage.getItem("videourl");//视频地址
                memberId = localStorage.getItem("memberId");
                url= pubUrl + '/app/article/recommend/list';//首页推介列表
                gzurl=pubUrl + "/app/follow/list";//首页-关注-已关注圈子列表-----------------------关注tab：暂未登录，已登录时无关注数据接口------------
                gzLoginurl = pubUrl + "/app/article/follow/list";//首页-关注-已关注圈子列表--------x-关注tab：已登录时有关注数据接口------------
                tjurl=pubUrl + "/app/recommend/list";//首页-关注-你可能感兴趣（推介列表）
                hoturl = pubUrl + "/app/article/hot/list";//热帖
                M.strToken = localStorage.getItem("token") ;//判断是否登录
                par = {'pageNo': pageNo, 'pageSize': pageSize, 'memberId': memberId};
                tjpar = {'pageNo': pageNo, 'pageSize': pageSize, 'memberId': memberId};
                this.requestData(url, tjpar, "tj");//默认： 不管登录与否加载首页推介列表
                this.dropDown();
                this.initClick();
                M.dianZan();
                M.collection();
            },
            //
            initClick: function () {
                //滚动加载
                $(document).on('infinite', '.infinite-scroll', function () {
                    if (loading) return;
                    if (M._scrollOver) {//滚动到底部
                        return false;
                    }
                    $(".infinite-scroll-preloader").css("display", 'block');
                    pageNo++;
                    loading = true;
                    var tjpar = {'pageNo': pageNo, 'pageSize': pageSize, 'memberId': memberId};
                    if (tab == "tab1") {
                        M.requestDataRefresh(url, tjpar);
                    } else if (tab == "tab2") {
                        if (!M.strToken  || M.strToken=='undefined' || M.strToken=='null') {//未登录
                            M.requestDataRefresh(tjurl, tjpar);
                        } else {
                            var par = {pageNo: pageNo, pageSize: pageSize, memberId: memberId};
                            if (M.gzLoginData) {//true 证明展示的是圈子内容列表数据，调用gzLoginurl
                                M.requestDataRefresh(gzLoginurl, par);
                            } else {
                                M.requestDataRefresh(tjurl, par);
                            }
                            $('.mypreloader').css('display', 'block');
                        }
                    } else if (tab == "tab3") {
                        M.requestDataRefresh(hoturl, tjpar);
                    }
                });
                //切换首页tab
                $('.buttons-tab >a').click(function () {
                    pageNo = 1;
                    var $this = $(this);
                    M._scrollOver = false;//默认没加载完
                    var tjpar = {'pageNo': pageNo, 'pageSize': pageSize, 'memberId': memberId};
                    //$.attachInfiniteScroll($('.infinite-scroll'));//启动滚动事件
                    if ($this.hasClass('tj')) {//tab1
                        tab = "tab1";

                        M.requestData(url, tjpar);
                    } else if ($this.hasClass('guanzhu')) {//tab2
                        tab = "tab2";
                        if (!M.strToken  || M.strToken=='undefined' || M.strToken=='null') {//未登录 //未登录，展示推介圈子列表，关注列表无数据dom替代
                            M.requestData(tjurl, tjpar, "tj");//推介圈子列表
                            //  M.requestData(gzurl,par,"gz");
                        } else { //登录，只需展示关注列表
                            M.requestLoginGz(gzLoginurl, tjpar, "loginGz");//先调已登录关注列表，判断有无数据，若无关注数据，再调tjurl
                        }
                    } else if ($this.hasClass('hot')) {
                        tab = "tab3";

                        M.requestData(hoturl, tjpar);//热帖与首页推介列表参数一致
                    }

                });
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
                //关注
                $("body").on('click', '.add-attention', function (e) {
                    if (!M.strToken  || M.strToken=='undefined' || M.strToken=='null') {//未登录
                        window.location.href = "login.html?fromPage=1";
                    } else {
                        $(this).find("img").attr("src", "images/tick@2x.png");
                        var groupId = $(this).parent(".middle-content").attr("data-id");
                        var url = pubUrl + "/app/follow/save";
                        var savepar = {groupId: groupId, memberId: memberId};
                        //调用添加关注
                        M.requestData(url, savepar, 'save');
                    }
                })
            },
            //下拉刷新
            dropDown: function (data) {
                $(document).on('refresh', '.pull-to-refresh-content', function (e) {
                    var tjpar = {'pageNo': pageNo, 'pageSize': pageSize, 'memberId': memberId};
                    var t = setTimeout(function () {
                        if (tab === "tab1") {
                            pageNo = 1;

                            M.requestData(url, tjpar);
                        } else if (tab === "tab2") {
                            pageNo = 1;

                            M.requestData(gzLoginurl, tjpar, "gz");
                        } else if (tab === "tab3") {
                            pageNo = 1;

                            M.requestData(hoturl, tjpar);
                        }
                        $.pullToRefreshDone('.pull-to-refresh-content');
                        clearTimeout(t);
                    }, 1000);
                });
            },
            //登录状态：请求数据
            requestLoginGz: function (url, parameter, str) {
                $.ajax({
                    type: 'post',
                    url: url,
                    data: parameter,
                    dataType: 'json',
                    timeout: 6000,
                    success: function (data) {
                        if (data.data.length > 0) {
                            M.gzLoginData = true;
                            M.render(data, false, str);
                        } else {
                            M.gzLoginData = false;
                            M.requestData(tjurl, tjpar, "tj");//推介圈子列表

                        }
                    },
                    error: function (xhr, type) {
                        $.toast('服务器开小差了～');
                        return false;
                    }
                })
            },
            //请求数据
            requestData: function (url, parameter, str) {
                $.ajax({
                    type: 'post',
                    url: url,
                    data: parameter,
                    dataType: 'json',
                    timeout: 6000,
                    success: function (data) {
                        M.render(data, false, str);
                        $.pullToRefreshDone('.pull-to-refresh-content');
                    },
                    error: function (xhr, type) {
                        $.toast('服务器开小差了～');
                        return false;
                    }
                })
            },
            requestDataRefresh: function (url, parameter) {
                $.ajax({
                    type: 'post',
                    data: parameter,
                    url: url,
                    dataType: 'json',
                    timeout: 6000,
                    success: function (data) {
                        M.render(data, true);
                        loading = false;
                        var calCount = pageNo * pageSize;
                        if (calCount >= data.page.totalCount) {
                            // // 加载完毕，则注销无限加载事件，以防不必要的加载
                            // $.detachInfiniteScroll($('.infinite-scroll'));
                            // // 删除加载提示符
                            $('.infinite-scroll-preloader').remove();
                            $('.mypreloader').removeClass('hide');

                            M._scrollOver = true;//滚动到底部
                            return;
                        }
                        $.refreshScroller();
                    },
                    error: function (xhr, type) {
                        $.toast('服务器开小差了～');
                        return false;
                    }
                })
            },

            //渲染模板
            render: function (data, isscroll, str) {
                //andiqu
                if (tab === "tab1") {//推介

                    $.map(data.data, function (item, index) {
                        item.avatar = picUrl + item.avatar;
                        item.imageUrl = picUrl + item.imageUrl;
                        item.videoCover = picUrl + item.videoCover;
                        item.groupLogo = picUrl + item.groupLogo;
                        // item.thumbnail=picUrl+item.thumbnail;
                        item.picurl = picUrl;
                        return data.data;
                    });
                    //isscroll：false 无️刷新
                    if (isscroll) {
                        var _html = template('parentTpl', data);
                        $('#card-content').append(_html);
                    } else {
                        var _html = template('parentTpl', data);
                        $('#card-content').html(_html);


                    }
                } else if (tab === "tab2") {//关注
                    data.token = M.strToken//
                    alert(data.token)
                    if (!M.strToken  || M.strToken=='undefined' || M.strToken=='null') {//未登录
                        $.map(data.data, function (item, index) {
                            item.logo = picUrl + item.logo;
                            data.data[index].qzName = String(encodeURI(item.name));
                            return data.data;
                        });//andiqu
                        if (str === "tj") {
                            $(".xia").html(template("interestTpl", data));
                        }

                        data.data = [];//空数组，展示暂未关注圈子
                        $(".shang").html(template("goGuanzhuTpl", data));
                    } else {//login
                        if (M.gzLoginData) {//gzLoginurl 有数据
                            $.map(data.data, function (item, index) {
                                item.avatar = picUrl + item.avatar;
                                item.imageUrl = picUrl + item.imageUrl;
                                item.videoCover = picUrl + item.videoCover;
                                item.groupLogo = picUrl + item.groupLogo;
                                item.thumbnail = picUrl + item.thumbnail;
                                return data.data;
                            });
                            if (isscroll) {
                                $(".shang").append(template("parentTpl", data));
                            } else {
                                $(".shang").html(template("parentTpl", data));
                            }
                        } else {//无数据 调用 gzurl
                            $.map(data.data, function (item, index) {
                                item.logo = picUrl + item.logo;
                                data.data[index].qzName = String(encodeURI(item.name));
                                return data.data;
                            });//andiqu
                            if (isscroll) {
                                $(".xia").append(template("interestTpl", data));
                            } else {
                                if (str === "tj") {
                                    $(".xia").html(template("interestTpl", data));
                                }
                                data.data = [];//空数组，展示暂未关注圈子
                                $(".shang").html(template("goGuanzhuTpl", data));
                            }
                        }
                    }

                } else if (tab === "tab3") {//热帖

                    $.map(data.data, function (item, index) {
                        item.avatar = picUrl + item.avatar;
                        item.imageUrl = picUrl + item.imageUrl;
                        item.videoCover = picUrl + item.videoCover;
                        item.groupLogo = picUrl + item.groupLogo;
                        item.thumbnail = picUrl + item.thumbnail;
                        return data.data;
                    });
                    //andiqu
                    if (isscroll) {
                        var _html = template('parentTpl', data);
                        $('#card-content3').append(_html);
                    } else {
                        var _html = template('parentTpl', data);
                        $('#card-content3').html(_html);
                    }
                }

            },

            //获取参数
            getQueryString: function (name) {
                var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
                var r = window.location.search.substr(1).match(reg);
                if (r != null) return unescape(r[2]);
                return null;
            },
            //收藏
            collection: function () {
                $(document).on('click', '.collection', function () {
                    var _this = $(this);
                    if (!M.strToken  || M.strToken=='undefined' || M.strToken=='null') {//未登录
                        location.href = 'login.html';
                        return false;
                    }
                    var articleId = _this.attr("articleId");
                    var memberId = localStorage.getItem("memberId");//正常取
                    var title = $(".picture-Content-header").text();
                    var imageUrl = _this.find("img").attr("src");
                    var type = 1;
                    var par = {articleId: articleId, memberId: memberId};
                    var url = pubUrl + "/app/favor/save";
                    $.ajax({
                        type: 'post',
                        url: url,
                        data: par,
                        dataType: 'json',
                        timeout: 6000,
                        success: function (data) {
                            if (data.code == 1) {//收藏成功
                                _this.find("img").attr("src", "images/all_icon_Collection_press.png");
                            } else if (data.code == 2) {//取消收藏成功
                                _this.find("img").attr("src", "images/all_icon_Collection_normal.png");
                            }
                            else {//接口错误
                                $("body").dalutoast(data.message);
                            }
                        },
                        error: function (xhr, type) {
                            $.toast('服务器开小差了～');
                            return false;
                        }
                    })
                })
            },
            //点赞
            dianZan: function () {
                $(document).on('click', '.fabulous', function () {
                    var _this = $(this);
                    if (!M.strToken  || M.strToken=='undefined' || M.strToken=='null') {//未登录
                        location.href = 'login.html';
                        return false;
                    }
                    var memberId = localStorage.getItem("memberId");
                    var articleId = _this.attr("articleId");
                    var par = {memberId: memberId, articleId: articleId};
                    var url = pubUrl + "/app/support/isFaver";
                    var num = parseInt(_this.find("span").text());
                    $.ajax({
                        type: 'post',
                        url: url,
                        data: par,
                        dataType: 'json',
                        timeout: 6000,
                        success: function (data) {
                            if (data.code == 0) {//点赞成功

                                _this.find("img").attr("src", "images/all_icon_Good_press.png");
                                _this.find("span").text(++num);
                            } else if (data.code == 1) {//取消点赞
                                _this.find("img").attr("src", "images/all_icon_Good_normal.png");
                                _this.find("span").text(--num);
                                var token = localStorage.getItem('token') || '';
                            } else {
                                $("body").dalutoast(data.message)
                            }
                        },
                        error: function (xhr, type) {
                            $.toast('服务器开小差了～');
                            return false;
                        }
                    })
                })
            },

        };
        function getdtInfFunc() {//动态获取域名
            var strUrl = sessionStorage.getItem("geturl");//写死
            var url=strUrl+'/app/domain/getDomainList';
            $.ajax({
                type: 'post',
                url: url,
                dataType: 'json',
                timeout: 6000,
                async:false,
                success: function (data) {
                    console.log(data);
                   // sessionStorage.setItem("basicDomain",data.server[0].domainName);//备用url domain
                    localStorage.setItem("puburl",data.server[0].domainName);//接口url domain
                   // localStorage.setItem("puburl","http://10.10.30.128:8080");
                    localStorage.setItem("picurl",data.viewPicture[0].domainName);//图片接口url domain
                    localStorage.setItem("videourl",data.viewVideo[0].domainName);//视频接口url domain
                    localStorage.setItem("pictureUpload",data.pictureUpload[0].domainName);//腿跑上传接口url domain
                    localStorage.setItem("videoUpLoad",data.videoUpLoad[0].domainName);//视频上传接口url domain
                    // sessionStorage.setItem("basicDomain",data.basicDomain[0].domainName);//备用接口url domain

                    return true;
                },
                error: function (xhr, type) {
                    $.toast('服务器开小差了～');
                    return false;
                }
            })
        };
        function callDevice(i) {
            getdtInfFunc();
            pubUrl=localStorage.getItem('puburl');
            if (i === 0) {
                var id = "1002A890-116C-410B-99CA-C78F7A3CF6FA";
                var url = pubUrl + '/app/memberInfo/getUserInfo';
                var memberId = localStorage.getItem('memberId') || null;
                if (memberId == null) {
                    $.ajax({
                        type: 'post',
                        url: url,
                        data: {'deviceNo': id, 'token': ''},
                        dataType: 'json',
                        timeout: 6000,
                        success: function (data) {
                            if (data.code == 0) {
                                localStorage.setItem('memberId', data.data.id);//正常取
                                M.init();
                            }
                        },
                        error: function (xhr, type) {
                            $.toast('服务器开小差了～');
                            return false;
                        }
                    })
                } else {
                    M.init();
                }
            } else {
                dsBridge.call("home.getUUIDFromJS", "home.getUUIDFromJS", function (data) {
                    getmenberId(data);
                });
            }
        };

        function getmenberId(id) {
            localStorage.setItem("deviceNo", id);
            dsBridge.call("home.getUserInfo", {}, function (data) {
                //alert(JSON.stringify(data));
                localStorage.setItem('memberId',data.memberid);
                localStorage.setItem('token',data.token);
                sessionStorage.setItem('fromPage', "home");
                var url = pubUrl + '/app/memberInfo/getUserInfo';
                if(localStorage.getItem('memberId')==""||localStorage.getItem('memberId')==null||localStorage.getItem('memberId')=="null"||localStorage.getItem('memberId')==undefined||localStorage.getItem('memberId')=="undefined"){
                    $.ajax({
                        type: 'post',
                        url: url,
                        data:{},
                        data: {'deviceNo': id, 'token': localStorage.getItem('token')},
                        dataType: 'json',
                        timeout: 6000,
                        success: function (data) {
                            //alert(JSON.stringify(data));
                            if (data.code == 0) {
                                var param = {memberid: data.data.id.toString(), userid: "", usertype: ""};
                                dsBridge.call("home.getUserInfo", param, function (data) {
                                    //alert(JSON.stringify(data));
                                    if (data.memberid == "" || data.memberid == null || data.memberid == "null" || data.memberid == undefined || data.memberid == "undefined") {
                                        data.memberid = "";
                                    }
                                    localStorage.setItem('memberId', data.memberid);
                                    M.init();
                                })
                            }
                        },
                        error: function (xhr, type) {
                            $.toast('服务器开小差了～');
                            return false;
                        }
                    })
                }else{
                    M.init();
                }
                
            })
        };
        callDevice(1);//1 发布  0本地测试
        $.init();
    })
});
