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
    'template': 'lib/template.min'
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
require(['Zepto','template','sm','touch','ani','config'], function($,template) {
  $(function(){
    $(".backdiv").tap(function(){
        window.history.go(-1);
    });
    var M = {
            puburl: localStorage.getItem("puburl"),
            picurl: localStorage.getItem("picurl"),
            memberId:'',
            pageNo:1,
            pageSize:10,
            loading :false,
            id:"",
            landlord:0,//是否楼主 0.否1.是
            timeSort:"ASC",//时间排序 ASC:正序 ,DESC:倒序
            init: function(){
              var _this = this;
                this.id = this.getQueryString("id");

                M.memberId=this.getQueryString("memberId");
                this.reqs();
                this.reqdata(false);
                this.scroll();
                this.bk();
                this.toggleGongneng();
            },
            getQueryString:function (name) {
              var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
              var r = window.location.search.substr(1).match(reg);
              if (r != null) return unescape(r[2]); return null;
            },

            bk:function(){
              var _this = this;          
              
            },
            reqdata:function(isScroll){
                  var url = this.puburl+'/app/comment/commentList';
                  var param = {articleId:this.id,landlord:this.landlord,timeSort:this.timeSort}
                  this.req(url,param,isScroll);           
            },
            reqs:function(){
                _this = this; 
                $.ajax({
                      type: 'post',
                      url: _this.puburl+'/app/article/recommend/detail',
                      data:{memberId:M.memberId,id:_this.id},
                      dataType: 'json',
                      timeout: 3000,
                      success: function(data){
                        console.log(data);
                        if(data.code == 0){ 
                          $(".quanziName").html(data.data.groupName);
                          $("#clocknum").text(data.data.commentTimes);
                          $("#zannum").text(data.data.goodNum);
                          data.data.picurl = _this.picurl;
                          data.data.imageUrl = data.data.imageUrl.split(";");
                          var html = template("tiezidetailTpl",data);
                          $("#tiezidetail").html(html);
                        }
                      },
                      error: function(xhr, type){}
                });
            },
            req: function(url,param,isScroll){
                var _this = this;
                $.ajax({
                      type: 'post',
                      url: url,
                      data:param,
                      dataType: 'json',
                      timeout: 3000,
                      success: function(data){
                        console.log(data);
                        _this.handle(data,isScroll);
                      },
                      error: function(xhr, type){
                        
                      }
                })
            },

            handle:function(data,isScroll){
                var _this = this;
                data.picurl = this.picurl;
                if(data.code == 0&&data.data.length>0){ 
                      if(isScroll){
                          var html = template("commentTpl",data);
                         $("#full-reply").append(html)
                      }else{
                         var html = template("commentTpl",data);
                         $("#full-reply").append(html)
                      }
                      _this.loading = false;  
                      _this.bk();                       
                } 
            },
            scroll:function(){
                var _this = this;
                $(document).on('infinite', '.infinite-scroll-bottom',function() {
                    if (_this.loading) return;
                    _this.loading = true;
                    _this.reqdata(true);
                })
            },
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

