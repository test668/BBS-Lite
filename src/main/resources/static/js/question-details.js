let question_dianzan_count;
let question_shoucang_count;
let question_comment_count;
let thumb_up = "icon-zan";
let follow = "icon-shoucang";
let comment = "icon-pinglun";
let select_comment = ">.comment-box>.comment-head>.comment-name>a";
$(function () {
    // 加载问题详情
    //TODO 非法访问限制
    $("#question_detail").empty();
    const url = "/loadQuestionDetail";
    const jsonData = {
        "id": getQuestionId(),
        contentType: "application/json;charset=UTF-8"
    };
    $.ajax({
        type: "GET",
        url: url,
        data: jsonData,
        beforeSend: open_loading(),
        success: function (data) {
            if (data.code === 200) {
                document.title = data.extend.question.title;
                load_question_info(data.extend.question);
                debugger;
                if(data.extend.question.commentCount > 0) {
                    show_more_comment();
                }
                load_question_detail_right(data.extend);
                $("html,body").animate({scrollTop: 0}, 0);//回到顶端
            } else {
                fail_prompt(data.message);
                setTimeout(function () {
                    location.href = "/";
                },1500)
            }
        },
        complete: close_loading()
    });
});

function click_options() {
    $(document).on('click', "#"+thumb_up, function () {
        like_or_follow_question("/thumbUpQuestion",thumb_up,"点赞",question_dianzan_count);
    });
    $(document).on('click',"#icon-bianji",function () {
        location.href = "/publish?id=" + getQuestionId();
    });
    $(document).on('click',"#"+follow,function () {
        like_or_follow_question("/followQuestion",follow,"收藏",question_shoucang_count);
    });
    $(document).on('click',"#"+comment, function(){
        if($("#comment_input").length === 0){
            $("#question_detail").append(
                '<div id="comment_input" class="col-lg-12 col-md-12 col-xs-12 col-sm-12 collapse" style="padding-right: 0">' +
                '<textarea class="form-control" rows="5"></textarea>' +
                '<button class="btn btn-info right" id="commit_comment" style="' +
                'margin: 10px 0;' +
                'float: right;' +
                '">发布</button></div>'
            )
        }
        $(".collapse").collapse('toggle');
    });
    $(document).on('click',"#commit_comment",function () {
        commit_comment(0);
    });
    $(document).on('click',".comment-post>a:odd",function () {
        alert("click odd");
    });
    $(document).on('click',".comment-post>a:even",function () {
        alert("click even");
    });
}

function commit_comment(val) {
    let jsonData = {
        "questionId":getQuestionId(),
        "pid":0,
        "content":$("#commit_comment").prev().val(),
        contentType:"application/json;charset=UTF-8"
    };
    $.ajax({
        type: "POST",
        url: "/commitComment",
        data: jsonData,
        beforeSend: open_loading(),
        success: function (data) {
            if (data.code !== 200) {
                fail_prompt(data.message);
                setTimeout(function () {
                    location.href = "/";
                },1500)
            }
            load_comment_info();
        },
        complete:close_loading()
    });
}

function like_or_follow_question(url,icon,show,count) {
    $.ajax({
        type: "POST",
        url: url,
        data: {
            "id":getQuestionId(),
            "isActive":$("#"+icon).hasClass("on")
        },
        success: function (data) {
            if (data.code === 200) {
                let info = data.extend;
                count += (info.isActive?1:-1);
                add_option(count,show,icon,info.isActive,true);
            }
            else {
                fail_prompt(data.message);
            }
        },
    });
}

/**
 * 添加问题下方按钮(点赞/收藏/评论/编辑)
 * @param count 计数信息(点赞/收藏等)
 * @param show  展示的文字
 * @param icon  图标信息(class)
 * @param isActive 是否选中
 * @param show_count 是否展示计数信息
 */
function add_option(count,show,icon,isActive,show_count) {
    if(isActive != null) {
        let html = '<span class="option ' + (isActive ? 'on' : '') + '" value="' + isActive + '" id="'
            + icon + '"' +
            (icon===comment?' data-toggle="collapse" aria-expanded="false" aria-controls="comment_input"':'') +
            '><i class="iconfont ' + icon + '"></i>' + (isActive ? '已' : '');

        if($("#"+icon).length > 0) {
            let count2 = $("#"+icon).text().replace(/[^\d]/g, '');
            count2 = parseInt(count2) + (isActive?1:-1);
            if (show_count) {
                show += '(' + count2 + ')';
            }
            html += show + '</span>';
            $("#"+icon).replaceWith(html);
        }else {
            if (show_count) {
                show += '(' + count + ')';
            }

            html += show + '</span>';
            $("#option_item").append(html);
        }
    }
}
/**
 * 加载可交互选项信息(编辑/点赞/收藏等)
 * @param creator
 * @param questionId
 */
function load_question_option(creator, {commentCount:questionComment,followCount: questionFollow, id: questionId, likeCount: questionThumb}) {
    const url = "/loadQuestionOption";
    const jsonData = {
        "questionId": questionId,
        "userId": creator,
        contentType: "application/json;charset=UTF-8"
    };

    $.ajax({
        type: "GET",
        url: url,
        data: jsonData,
        success: function (data) {
            if (data.code == "200") {
                let options = data.extend.options;
                add_option(questionThumb,"点赞",thumb_up,options.isThumbUpQuestion,true);
                add_option(questionFollow,"收藏",follow,options.isFollowQuestion,true);
                add_option(null,"评论",comment,false,false);
                add_option(null,"编辑问题","icon-bianji",options.isCreator,false);
                click_options();
            }
        },
    });
}


function show_more_comment() {
    let show_more = $("<div class='col-lg-12 col-md-12 col-xs-12 col-sm-12' style='text-align: center'></div>");
    show_more.append($("<span href='#' style='cursor: pointer;color: #155faa;font-size: 14px;' id='show_more_comment'>" +
        "查看评论 <i class='iconfont icon-xiangxia'></i></span>"));
    show_more.click(function () {
        load_comment_info();
    });
    $("#question_detail").append(show_more);
}
function load_comment_info(){
    $("#show_more_comment").empty();
    $("#question_comment").empty();
    const url = "/loadComment";
    const jsonData = {
        "id": getQuestionId(),
        "contentType": "application/json;charset=UTF-8"
    };

    $.ajax({
        type: "GET",
        url: url,
        data: jsonData,
        beforeSend: open_loading(),
        success: function (data) {
            if (data.code == "200") {
                load_comments(data);
            } else {
            }
        },
        complete: close_loading()
    });
}


/**
 * 构建页面右栏
 * @param data question详情
 */
function load_question_detail_right(data) {

    const userInfo = data.user;
    let userSimpleInfo = '\n' +
        '            <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">\n' +
        '                <small style="color: #333">发起人</small>\n' +
        '                <hr>\n' +
        '                <div class="media media-left" style="width: 120%">\n' +
        '                    <a href="/">\n' +
        '                        <img class="media-min img-circle" src="' + userInfo.avatarUrl + '">\n' +
        '                    </a>\n' +
        '                </div>\n' +
        '\n' +
        '                <hr>\n' +
        '                <small style="font-size: 12px;color: #1f1f1f;">\n' +
        '                    昵称:\n' +
        '                    <!-- TODO 跳转到个人主页 -->\n' +
        '                    <a href="#" style="color: #155faa">' + userInfo.name + '</a>\n' +
        '                    <br>\n';

        if (userInfo.htmlUrl !== "null") {
            userSimpleInfo +=
                '                    <span>\n' +
                '                        网址:<a target="_blank" href="' + userInfo.htmlUrl + '" style="color: #155faa">\n' +
                '                        ' + userInfo.htmlUrl + '</a>\n' +
                '                    </span>\n<br>';
        }
        if (userInfo.bio !== "null") {
            userSimpleInfo +=
                '                    <span>\n' +
                '                        简介:<span style="color: #155faa">'+ userInfo.bio + '</span>\n' +
                '                    </span>\n';
        }
        userSimpleInfo +=
        '            </div>\n' +
        '            <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">\n' +
        '                <hr class="col-lg-11 col-md-11 col-sm-11 col-xs-11">\n' +
        '                <h4>相关问题</h4>\n' +
        '            </div>\n';
        $("#question_detail_right").append(userSimpleInfo);
}


function load_question_info(questionInfo) {
    question_dianzan_count = questionInfo.likeCount;
    question_shoucang_count = questionInfo.followCount;
    question_comment_count = questionInfo.commentCount;
    const tags = questionInfo.tag.split(' ');
    let questionDetail = '<h3>' +
        '                   <span>' + questionInfo.title + '</span></h3>\n' +
        '                      <span class="aw-question-content">\n' +
        '                      <span>' + questionInfo.viewCount + ' 次浏览 • </span>\n' +
        '                      <span>' + questionInfo.likeCount + ' 人点赞 • </span>\n' +
        '                      <span> 发表于' + formatTimestamp(questionInfo.gmtCreate) + '</span>\n' +
        '                   </span><br>\n';

    $.each(tags,function (index, item) {
        const tagInfo =
            '<span class="label label-tag">\n' +
            '  <a href="/?tag=' +  item + '" target="_parent" style="color: #fff;cursor: pointer;text-decoration: none;">\n' +
            '      <i class="iconfont icon-biaoqian1"></i>\n' +
            '      <span>' + item + '</span>\n' +
            '  </a>\n' +
            '</span>\n';
        questionDetail += tagInfo;
    });
    questionDetail +=
        '<hr class="col-lg-12 col-md-12 col-xs-12 col-sm-12">\n' +
        '<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">\n' + questionInfo.description +'</div>'+
        '<div class="col-lg-12 col-md-12 col-xs-12 col-sm-12" id="option_item"></div>' +
        '    <hr class="col-lg-12 col-md-12 col-xs-12 col-sm-12">\n' +
        '</div>';
    $("#question_detail").append(questionDetail);
    load_question_option(questionInfo.creator,questionInfo);
}
/**
 * 根据请求的url返回id值
 * @returns {string} id
 */
function getQuestionId() {
    return document.location.pathname.replace("/question/", "");
}

function load_comments(data) {
    let comments = data.extend.comments;
    let view = '<div class="col-lg-12 col-md-12 col-xs-12 col-sm-12">\n' +
        '    <ul id="comments-list" class="comments-list">\n' +
        '    </ul>\n' +
        '</div>';
    $("#question_comment").append(view);
    $.each(comments,function (index,item) {
        load_comment_html(item);
    })
}
function load_comment_html(comment) {
    let html =
        '        <li style="margin: 0">\n' +
        '            <div class="comment-main-level">\n' +
        '                <div class="comment-avatar"><img src="' + comment.user.avatarUrl + '" alt=""></div>\n' +
        '                <div class="comment-box">\n' +
        '                    <div class="comment-head">\n' +
        '                        <h6 class="comment-name ' + (comment.isAuthor?'by-author':'') + '">\n' +
        '                            <a href="'+ comment.user.htmlUrl + '">'+ comment.user.name + '</a>\n' +
        '                        </h6>\n' +
        '                        <span class="comment-post pull-right" > \n' +
        '                            <input value="' + comment.user.id + '" hidden="true">' +
        '                                 <span class="option"><i class="iconfont icon-dianzan" ></i>评论</span>\n' +
        '                                 <span class="option" style="margin-right: 25px"><i class="iconfont icon-shoucang" ></i>点赞</a></span>\n' +
        '                    </span></div>\n' +
        '                    <div class="comment-content">' + comment.content +
        '                        <span> ' + formatTimestamp(comment.gmtCreate) + '</span>\n' +
        '</div>\n' +
        '                </div>\n' +
        '            </div>\n';

        $.each(comment.son,function (index,item) {
            html +=
                '            <!-- Respuestas de los comentarios -->\n' +
                '            <ul class="comments-list reply-list">\n' +
                '                <li>\n' +
                '                    <!-- Avatar -->\n' +
                '                    <div class="comment-avatar"><img src="' + item.user.avatarUrl + '" alt=""></div>\n' +
                '                    <!-- Contenedor del Comentario -->\n' +
                '                    <div class="comment-box">\n' +
                '                        <div class="comment-head">\n' +
                '                            <h6 class="comment-name"><a href="'+ item.user.htmlUrl + '">'+ item.user.name + '</a></h6>\n' +
                '                            <span class="comment-post pull-right">\n' +
                '                            <input value="' + item.user.id + '" hidden="true">' +
                '                                 <span class="option"><i class="iconfont icon-dianzan"></i>评论</span>\n' +
                '                                 <span class="option" style="margin-right: 25px"><i class="iconfont icon-shoucang"></i>点赞</a></span>\n' +
                '                            </span>\n' +
                '                        </div>\n' +
                '                        <div class="comment-content">'+ item.content +
                '                            <span>' + formatTimestamp(item.gmtCreate) + '</span>\n' +
                '                    </div></div>\n' +
                '                </li>\n' +
                '            </ul>\n' +
                '        </li>\n';
        });
        $("#comments-list").append(html);
}