/**
 * Created by dalu on 2018/3/19.
 */
require.config({
  baseUrl: 'js',
  paths: {
    'Zepto':['lib/Zepto.min'],
    'touch':'lib/touch',
    'ani':'lib/animate',
    'sm':['lib/sm'],
    'config':'lib/config',
    'template': 'lib/template.min',
    'dsBridge':"lib/dsbridge"
  },
  shim: {
    'Zepto':{exports:'Zepto'},
    'touch':{deps:['Zepto']},
    'config':{deps:['Zepto']},
    'ani':{deps:['Zepto']},
    'sm':{
      deps: ['Zepto']
    }
  }
});
require(['Zepto','template','sm','touch','ani','config','dsBridge'], function($,template) {
  $(function(){
    $(".backdiv").tap(function(){
        window.history.go(-1);
    });

    var M = {
            puburl:localStorage.getItem("puburl"),
            id:"",
            memberId:localStorage.getItem("memberId"),
            sendTitle:sessionStorage.getItem("sendTitle"),
            sendCont:sessionStorage.getItem("sendCont"),//发布的文字内容
            chooseImg:"",
            chooseV:"",
            postType:"",
            show:"",
            isniming:"no",
            init: function(){
              var _this = this;
                this.postType = this.getQueryString("postType");
                this.show = this.getQueryString("show");
                this.isniming = this.getQueryString("isniming");
                if(M.isniming=="no"){
                  M.isniming = 0;
                }else{
                  M.isniming = 1;
                }
                if(this.postType == 1){
                  // 图片
                   M.chooseImg = sessionStorage.getItem("choosePic");
                  $(".toRel-uppic").removeClass("hide");
                  $(".toRel-bottom1").removeClass("hide");
                  if(M.chooseImg==""||M.chooseImg==null||M.chooseImg=="null"||M.chooseImg==undefined||M.chooseImg=="undefined"){
                        
                    }else{
                        $("#addPic").html("");
                        M.chooseImg = M.chooseImg.split(",");
                        $.each(M.chooseImg,function(index,item){
                          // $(".toRel-uppicbg").eq(index).find("img").attr("src", "data:image/png;base64,"+item);
                          var addPicHtml = '<div class="toRel-uppicbg"><img src="data:image/png;base64,'+item+'"></div>';
                          $("#addPic").append(addPicHtml);
                        });           
                    }   
                }else if(this.postType == 2){
                   M.chooseV = sessionStorage.getItem("chooseV");
                  $(".toRel-upvideo").removeClass("hide");
                  $(".toRel-bottom2").removeClass("hide");
                  if(M.chooseV==""||M.chooseV==null||M.chooseV=="null"||M.chooseV==undefined||M.chooseV=="undefined"){
                        
                    }else{
                        $("#addVideo").html("");
                        M.chooseV = M.chooseV.split(",");
                        $.each(M.chooseV,function(index,item){
                          //$(".toRel-upvideobg").eq(index).find("img").attr("src", "data:image/png;base64,"+item);
                          var addVideoHtml = '<div class="toRel-upvideobg"><img src="data:image/png;base64,'+item+'"></div>';
                          $("#addVideo").append(addVideoHtml);
                        });           
                    }   
                  // 视频
                }else if(this.postType == 3){   
                  this.show = this.getQueryString("show");
                  if(this.show == "pic"){
                    M.chooseImg = sessionStorage.getItem("choosePic");
                    $(".toRel-uppic").removeClass("hide");
                    $(".toRel-bottom1").removeClass("hide"); 
                    if(M.chooseImg==""||M.chooseImg==null||M.chooseImg=="null"||M.chooseImg==undefined||M.chooseImg=="undefined"){
                        
                    }else{
                        $("#addPic").html("");
                        M.chooseImg = M.chooseImg.split(",");
                        $.each(M.chooseImg,function(index,item){
                          //$(".toRel-uppicbg").eq(index).find("img").attr("src", "data:image/png;base64,"+item);
                          var addPicHtml = '<div class="toRel-uppicbg"><img src="data:image/png;base64,'+item+'"></div>';
                          $("#addPic").append(addPicHtml);
                        });           
                    }   
                  }else if(this.show == "video"){
                    M.chooseV = sessionStorage.getItem("chooseV");
                    $(".toRel-upvideo").removeClass("hide");
                    $(".toRel-bottom2").removeClass("hide");
                    if(M.chooseV==""||M.chooseV==null||M.chooseV=="null"||M.chooseV==undefined||M.chooseV=="undefined"){
                        
                    }else{
                       $("#addVideo").html("");
                        M.chooseV = M.chooseV.split(",");
                        $.each(M.chooseV,function(index,item){
                          //$(".toRel-upvideobg").eq(index).find("img").attr("src", "data:image/png;base64,"+item);
                          var addVideoHtml = '<div class="toRel-upvideobg"><img src="data:image/png;base64,'+item+'"></div>';
                          $("#addVideo").append(addVideoHtml);
                        });           
                    }   
                  }
                }
                this.id=this.getQueryString("id");
                $(".toRel-titlecont").html(this.sendTitle);
                $(".toRel-areacont").html(this.sendCont); 
                this.bk();  
            },
            bk:function(){
              var _this = this;          
              $("#fabu").click(function(){
                  $.modal({
                        title:  '发布确认',
                        text: '请确定是否发布所选内容',
                        buttons: [
                            {
                              text: '确定发布',
                              onClick: function() {
                                $(".toRel-bottom").hide();
                                $(".pro").removeClass("hide");
                                $(".jindu span").text("0%");
                                $(".offline-jinduing").css("width","0%");
                                $(".modal").remove(); 
                                if(_this.postType == 3&&_this.show == "text"){
                                    $.ajax({
                                        type: 'post',
                                        url: _this.puburl+'/app/article/publishArticle',
                                        data:{postType:_this.postType,title:_this.sendTitle,memberId:_this.memberId,description:_this.sendCont,
                                     imageUrl:"",videoUrl:"",groupId:_this.id,anonymous:M.isniming},
                                        dataType: 'json',
                                        timeout: 6000,
                                        success: function(data){
                                            dsBridge.call("compose.closeComposeControllerFromJS", "compose.closeComposeControllerFromJS", function (value) {
                                      
                                            })
                                        },
                                        error: function(xhr, type){
                                            $("body").dalutoast('服务器开小差了～')
                                            return false;
                                        }
                                    });
                                }else{
                                    _this.uploadImage();
                                    
                                }                        
                              }
                            },
                            {
                              text: '暂不发布',
                              onClick: function() {
                                $(".modal").remove();
                              }
                            }
                        ]
                      })
                });
            },
            initDsBridgeFunc: function(){
              // namespace test for asyn functions
              var _this = this;
              dsBridge.registerAsyn("compose", {
                tag: "compose",
                uploadPathArray:function (data, responseCallback) {
                    var paramdata = "";
                    if(_this.postType == 1){
                      // 图片
                      paramdata = {postType:_this.postType,title:_this.sendTitle,memberId:_this.memberId,description:_this.sendCont,
                                     imageUrl:data,videoUrl:"",groupId:_this.id,anonymous:M.isniming}
                    }else if(_this.postType == 2){
                      paramdata = {postType:_this.postType,title:_this.sendTitle,memberId:_this.memberId,description:_this.sendCont,
                                     imageUrl:"",videoUrl:data,groupId:_this.id,anonymous:M.isniming}
                      // 视频
                    }else if(_this.postType == 3){   
                        _this.show = _this.getQueryString("show");
                        if(_this.show == "pic"){
                          paramdata = {postType:_this.postType,title:_this.sendTitle,memberId:_this.memberId,description:_this.sendCont,
                                       imageUrl:data,videoUrl:"",groupId:_this.id,anonymous:M.isniming}
                        }else if(_this.show == "video"){
                          paramdata = {postType:_this.postType,title:_this.sendTitle,memberId:_this.memberId,description:_this.sendCont,
                                       imageUrl:"",videoUrl:data,groupId:_this.id,anonymous:M.isniming}
                        }
                    }
                    //alert(JSON.stringify(data));
                    $.ajax({
                        type: 'post',
                        url: _this.puburl+'/app/article/publishArticle',
                        data:paramdata,
                        dataType: 'json',
                        timeout: 6000,
                        success: function(data){
                          // alert(JSON.stringify(data));
                            dsBridge.call("compose.closeComposeControllerFromJS", "compose.closeComposeControllerFromJS", function (value) {
                            })
                        },
                        error: function(xhr, type){
                            $("body").dalutoast('服务器开小差了～')
                            return false;
                        }
                    });
                    
                }
            })
            },
            uploadImage: function () {
              dsBridge.call("compose.callUploadProgress", "compose.callUploadProgress", function (value) {
                value = Number(value).toFixed(2);
                //var valuelast = Number(1-value).toFixed(2);
                document.getElementById("progress").innerText = value*100+"%";
                $(".offline-jinduing").css("width",value*100+"%");
                if(parseInt(value)==1){
                  M.initDsBridgeFunc();
                }
              })
            },
            getQueryString:function (name) {
              var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
              var r = window.location.search.substr(1).match(reg);
              if (r != null) return unescape(r[2]); return null;
            }
        };
        
        M.init();
        $.init();
  })
})
