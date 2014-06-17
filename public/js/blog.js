

/**
 * Returns content from specified ckeditor field
 */
function getDataFromEditable(id) {
  var data = CKEDITOR.instances[id].getData(); 
  return data;
}

/**
 * Create blog post
 */
function createBlogPost() {
  
  var obj = {"postInfo": null};
  
  var postInfo = {};
  postInfo.title = getDataFromEditable('title');
  postInfo.urlfriendlytitle = getDataFromEditable('urlfriendlytitleeditor');
  postInfo.summary = getDataFromEditable('summary');
  postInfo.content = getDataFromEditable('content');
  postInfo.tags = [];

    $.ajax({
        type: "POST",
        url: "/createpost",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        async: false,
        data: JSON.stringify({"postInfo": postInfo}),
        success: function(data) {
           console.log('data: '+data); 
        },
        failure: function(data) { 
            console.log('ajax failure'); 
        }
    });
}

$("#submitButton").click(function() {
  createBlogPost();
});
