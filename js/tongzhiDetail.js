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
    'template': 'lib/template.min'
  },
  shim: {
    'Zepto':{exports:'Zepto'},
    'touch':{deps:['Zepto']},
    'ani':{deps:['Zepto']},
    'sm':{
      deps: ['Zepto']
    }
  }
});
require(['Zepto','template','sm','touch','ani'], function($,template) {
  $(function(){
    $(".backdiv").tap(function(){
        window.history.go(-1);
    });
    var puburl = localStorage.getItem("puburl");
    var memberId = localStorage.memberId;
    var id = getQueryString("id");
    function init(){
      $.ajax({
            type:'get',
            url: puburl+"/app/notice/detail?id="+id,
            dataType: 'json',
            timeout: 3000,
            success: function(data){
              console.log(data);
              var html = template("tongzhiDetailTpl",data);
              $(".content").html(html);
            },
            error: function(xhr, type){
              $("body").dalutoast('服务器开小差了～')
             return false;
            }
      })
    };
    function getQueryString(name) {
      var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
      var r = window.location.search.substr(1).match(reg);
      if (r != null) return unescape(r[2]); return null;
    };
    init();
    $.init();
  })
})
