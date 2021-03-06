var testEditor;

$(function () {
    testEditor = editormd("editor-md", {
        path: "https://alicdn.bestsort.cn/bbs/editor.md-master/lib/",  // Autoload modules mode, codemirror, marked... dependents libs path
        width: "100%",
        placeholder: "此处开始编写您要发布的内容...",
        emoji: true,
        taskList: true,
        flowChart: false,             // 开启流程图支持，默认关闭
        //sequenceDiagram: true,       // 开启时序/序列图支持，默认关闭,
        height: "600px",
        delay: 0,
        tex: true,
        saveHTMLToTextarea: true, // 保存 HTML 到 Textarea
        toolbarAutoFixed: true,//工具栏自动固定定位的开启与禁用
        syncScrolling: true,
        imageUpload: true,
        imageFormats: ["jpg", "jpeg", "gif", "png", "bmp", "webp"],
        toolbarIcons: "diy",
        imageUploadURL: "/upload",
        //theme : "dark",
        //previewTheme : "dark",
        //editorTheme : editormd.editorThemes['3024-night'],
        watch: false,
    });

    $("#push").click(function () {
        let json_data = {
            "description": testEditor.getMarkdown(),
            "tag":$("#tag").val(),
            "title":$("#title").val(),
            "topic":$("#topicType").val(),
        };
        if(getParam("id") != null){
            json_data["id"] = getParam("id");
        }
        let juge = jude_not_null(json_data);
        if(juge.length === 0){
            push_article(json_data);
        }else{
            $("#myModal").modal('show');
        }
    });

    // 加载文章详情
    function load_topic_option() {
        let id = getParam("id");
        let jsondata = {};
        if(id != null)
            jsondata["id"] = id;
        ajax_get("/getPublishInfo",jsondata,function (data) {
            let article = data.extend.publishInfo.article;
            if (article != null) {
                $("#title").val(article.title);
                $("#tag").val(article.tag);
                $("#article-description").val(article.description);
            }
            show_topic_option(data);
        },function (data) {
            fail_prompt(data.message);
            setTimeout(function () {
                location.href = "/";
            },1200)
        });
    }
    load_topic_option();
});
function push_article(json_data){
    ajax_post("/publish",json_data,function (data) {
        success_prompt("发布成功");
        setTimeout(function () {
            location.href = "/article/"+data.extend.id;
        },1500)
    });
}

function show_topic_option(data) {
    let article = data.extend.publishInfo.article;
    let selectTopic = null;
    if(article != null){
        selectTopic = article.topic;
    }
    if(selectTopic == null)
        selectTopic = 0;
    let topicInfos = data.extend.publishInfo.topics;
    let html = "";
    $.each(topicInfos,function (index,item) {
        if (item.id == selectTopic) {
            html += '<option value="' + item.id + '" selected>' + item.name + '</option>'
        } else {
            html += '<option value="' + item.id + '">' + item.name + '</option>';
        }
    });
    $("#topicType").append(html);
}

function jude_not_null(json_data) {
    let result = [];

    for(let key in json_data){
        if (json_data[key] === "") {
            result.push(key);
        }
    }
    return result;
}