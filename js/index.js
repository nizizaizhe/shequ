
require.config({
    baseUrl: 'js',
    paths: {
        'Zepto':['//g.alicdn.com/sj/lib/zepto/zepto.min','lib/Zepto.min'],
        'sm':['//g.alicdn.com/msui/sm/0.6.2/js/sm.min','lib/sm.min'],
        'template': 'lib/template.min',
        'config':'lib/config'
    },
    shim: {
        'Zepto':{exports:'Zepto'},
        'sm':{
            deps: ['Zepto']
        },
        'config':{deps:['Zepto']}
    }
});

require(['Zepto','template','sm','config'], function($,template) {
    $(function() {
        var M = {
            puburl:sessionStorage.puburl,
            devic:"",
            init:function(){
                devic = this.device();
                this.req();
            },
            device:function(){
                // H5 plus事件处理  
                /*function plusReady(){  
                    alert( "uuid: "+plus.device.uuid );  
                }  
                if(window.plus){  
                    plusReady();  
                }else{  
                    document.addEventListener("plusready",plusReady,false);  
                }  */
               
                return "uuid";
                
            },
            req: function(){
                var _this = this;
                $.ajax({
                      type: 'post',
                      url: this.puburl+'/app/memberInfo/getUserInfo',
                      data:{deviceNo:devic},
                      dataType: 'json',
                      timeout: 6000,
                      success: function(data){
                        console.log(data);
                        if(data.code == 0){
                            
                            localStorage.userId = data.data.userId;
                            localStorage.memberId = data.data.id;
                            _this.setTime();
                        }
                        
                      },
                      error: function(xhr, type){
                          $.toast(type);
                      }
                })
            }, 
            setTime: function() {
                var tout = setTimeout(function() {
                   
                    window.location.href='homeList.html';
                }, 2000);
            }
        }
        M.init();
        $.init();
    });
})