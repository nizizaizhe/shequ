
require.config({
    baseUrl: 'js',
    paths: {
        'Zepto':['lib/Zepto.min'],
        'touch':'lib/touch',
        'cg':'lib/config',
        'sm':['lib/sm'],
        'template': 'lib/template.min',
        'upload':'lib/upload'
    },
    shim: {
        'Zepto':{exports:'Zepto'},
        'touch':{deps:['Zepto']},
        'cg':{deps:['Zepto']},
        'sm':{
            deps: ['Zepto']
        },
        'upload':{deps:['Zepto']}
    }
});

require(['Zepto','template','sm','cg','upload','touch'], function($,template,sm,cg,upload) {
    var puburl = localStorage.getItem("puburl");
    var picurl = localStorage.getItem("picurl");
    var pictureUpload = localStorage.getItem("pictureUpload");
    var uploadpic = "";
    var uploadpiclabel = "";
    var userId = localStorage.userId;
    var memberId = localStorage.memberId;
    var tokenId = localStorage.token;
    $(".backdiv").tap(function(){
        window.history.go(-1);
     });
    $(function(){
        $(".saveedit").tap(function(){
            var nicheng = $(".nichengtxt").text();
            var gender ="" ;
            if($(".xingbie").text() == "女"){
                gender = 2;
            }else{
                gender = 1;
            }
            var phone = $(".teltxt").text();
            var id_card = $(".shenfentxt").text();
            if(uploadpic==""){
                uploadpic = uploadpiclabel
            }
            var param = {id:memberId,name:nicheng,sex:gender,avatar:uploadpic};               
            $.ajax({
                type: 'post',
                url: puburl+'/app/memberInfo/modify',
                data:param,
                dataType: 'json',
                timeout: 3000,
                success: function(data){
                    console.log(data);                         
                    init("刷新保存");             
                },
                error: function(xhr, type){
                        $("body").dalutoast('服务器开小差了～')
                        return false;
                }
            })
        });
       
        function init(str){
            /*$.showPreloader();*/
            $.ajax({
                type: 'post',
                url: puburl+'/app/memberInfo/member',
                data:{memberId:memberId,tokenId:tokenId},
                dataType: 'json',
                timeout: 3000,
                success: function(data){
                    console.log(data);
                    $.hidePreloader();
                    render(data);  
                    if(str == "刷新保存") {
                        $("body").dalutoast("保存成功"); 
                    }else{
                        uploadpiclabel = data.data.avatar;  
                    } 
                                  
                },
                error: function(xhr, type){
                        $("body").dalutoast('服务器开小差了～')
                        return false;
                }
            })
        };
        function render(data){
            data.picurl = picurl;
            var listHtml = template("editulTpl",data);  
            $("#editul").html(listHtml);
        };
        
        var xiangce = {
            initXiangce:function(){       
                this.eventBind();
            },
            eventBind:function(){
                var that = this;
                document.getElementById("uploads").addEventListener("change", function(e){
                    
                    var fileType = this.files[0].type;                         
                    var reader = new FileReader();
                    reader.readAsDataURL(this.files[0]);
                    reader.onload = function (e) {
                        that.compress(this.result,fileType);
                    };  

                    var url = pictureUpload+"/fileUpload/uploadImage";
                    var formData = new FormData();
                    var file = this.files[0];
                    formData.append('file',file);
                    $.ajax({
                        url: url,
                        type: 'POST',
                        cache: false,
                        data: formData,
                        processData: false,
                        contentType: false,
                        success: function(data){ 
                            if(data.code == 0){
                                uploadpic = data.url; 
                                $(".edit-touxiangicon").css("background","url("+picurl+uploadpic+")");
                                $(".edit-touxiangicon").css("border-radius","50%");
                                $(".edit-touxiangicon").css("background-size","100% 100%");                             
                            }                
                        },
                        error: function(xhr, type){
                          $("body").dalutoast('服务器开小差了～')
                          return false;
                        }
                    })               
                });
            
                document.getElementById("upload").addEventListener("change", function(){
                    var fileType = this.files[0].type;                         
                    var reader = new FileReader();
                    reader.readAsDataURL(this.files[0]);
                    reader.onload = function (e) {
                        that.compress(this.result,fileType);
                    };  

                    var url = pictureUpload+"/fileUpload/uploadImage";
                    var formData = new FormData();
                    var file = this.files[0];
                    formData.append('file',file);
                    $.ajax({
                        url: url,
                        type: 'POST',
                        cache: false,
                        data: formData,
                        processData: false,
                        contentType: false,
                        success: function(data){ 
                            data = JSON.parse(data);
                            if(data.code == 0){
                                uploadpic = data.url; 
                                $(".edit-touxiangicon").css("background","url("+picurl+uploadpic+")");
                                $(".edit-touxiangicon").css("border-radius","50%");
                                $(".edit-touxiangicon").css("background-size","100% 100%");
                            }                
                        },
                        error: function(xhr, type){
                          $("body").dalutoast('服务器开小差了～')
                          return false;
                        }
                    })                      
                });              
             },
            compress : function (res,fileType) {
                var that = this;
                var img = new Image();
                    img.src= res;
                    maxH = 300;
                    
                img.onload = function () {
                    var cvs = document.createElement('canvas'),
                        scale =1,
                        ctx = cvs.getContext('2d');
                        console.log(img.width);
                    if(img.width > 500 || img.height > 500){
                        if(this.width > this.height){    
                            scale = 500 / this.width;  
                        }else{    
                            scale = 500 / this.height;    
                        } 
                    }              
                    cvs.width = img.width*scale;
                    cvs.height = img.height*scale;
                    ctx.clearRect(0, 0, cvs.width, cvs.height);
                    ctx.drawImage(img, 0, 0, cvs.width, cvs.height);
                    var dataUrl = cvs.toDataURL(fileType, 0.8);                                  
                    $(".img_wrap").attr("src",dataUrl);
                }
            }
            // upload:function(image_data){
            //     /*这里写上次方法,图片流是base64_encode的*/
            //     var tourl = localStorage.puburl+'/nurse/headerImgUpload';
            //     $.ajax({
            //         type: 'post',
            //         url: tourl,
            //         data: {token:token,upfile:image_data},
            //         dataType: 'json',
            //         timeout: 3000,
            //         success: function(data){                 
            //            $(".img_wrap").attr("src",data.data);
            //         },
            //         error: function(xhr, type){
            //             console.log(xhr);
            //         }
            //     })
            // }
        };
        //选择相册图片
         $(document).on('click','.touxiang', function () {
            $.modal({
              title:  '',
              text: '',
              verticalButtons: true,
              buttons: [
                {
                  text: '拍照<input id="upload" type="file" name="upfile" accept="image/jpeg,image/jpg,image/png" capture="camera">',
                  onClick: function() {
                      xiangce.initXiangce();
                  }
                },
                {
                  text: '从手机相册选取<input id="uploads" type="file" name="upfiles">',
                  onClick: function() {
                     xiangce.initXiangce();
                  }
                },
                {
                  text: '取消',
                  onClick: function() {
                  }
                },
              ]
            })
        });
         //选择性别
         $(document).on('click','.choosesex', function () {
            $.popup('.popup-about');
            //$.closeModal(popup)
            var isSex = $(".xingbie").text();
            if(isSex == "女"){
                $(".male").removeClass("e5");
                $(".female").addClass("e5");
            }else{
                $(".female").removeClass("e5");
                $(".male").addClass("e5");
            }
            $(".male").click(function(){
                $(".female").removeClass("e5");
                $(this).addClass("e5");  
                isSex =  $(this).html();         
            });
            $(".female").click(function(){
                $(".male").removeClass("e5");
                $(this).addClass("e5");  
                isSex =  $(this).html();         
            });
          
            $(".sexcancel").click(function(){
                $.closeModal('.popup-about')
            });
            $(".sexsure").click(function(){  
                $(".xingbie").text(isSex);
                $.closeModal('.popup-about')
            });
        });
         //编辑昵称
        $(document).on('click','.nichengli', function () {
           $.prompt('请输入昵称',
                function (value) {
                   $(".nichengtxt").text(value);
                },
                function (value) {
                  
                }
            );
           $('.modal-inner').css('padding','.5rem');
        });
        //编辑Id
        /*$(document).on('click','.IDli', function () {
           $.prompt('请输入ID',
                function (value) {
                   $(".IDtxt").text(value);
                },
                function (value) {
                  
                }
            );
           $('.modal-inner').css('padding','.5rem');
        });*/
        
         init("");
        $.init();
    })
        
})