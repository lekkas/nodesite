/**
 * Get all tags.
 * Returns set: { "tagName1": count1, "tagName2": count2, ... }
 */
function getAllTags() {
    var tagList = {};
    $.ajax({
        type: "GET",
        url: "/quotes/tags",
        dataType: "json",
        async: false,
        success: function(data) {
            tagList = data;
        },
        failure: function(data) { 
            console.log('ajax failure'); 
            tagList = null;
        }
    });
    return tagList;
}

/**
 * Get all author names. 
 * Returns set: { "authorName1": count1, "authorName2": count2, ... }
 */
function getAllAuthors() {
    var authorList = {};
    $.ajax({
        type: "GET",
        url: "/quotes/authors",
        dataType: "json",
        async: false,
        success: function(data) {
            authorList = data;
        },
        failure: function(data) { 
            console.log('ajax failure'); 
            authorList = null;
        }
    });
    return authorList;
}

/**
 * Handles clicks on tag urls in the tag cloud.
 */
function tagClickHandler() {
    var selectedTag = $(this).text();
    $('#quotelist').empty();
    $.getJSON('/quotes/tag/'+selectedTag, function(data) {
        $.each(data, function(key, val) {
        var quote = '<div class="article-container">'+
            '<article style="float: left;">'+
            '<img src="images/quote_start_s.png" style="height: auto; margin-right: 10px; vertical-align: text-top;" />'+
            val.text+
            '<img src="images/quote_end_s.png" style="height: auto; margin-left: 10px; vertical-align: text-bottom;"/>'+
            '</article>'+
            '<div class="article-footer"><strong>'+val.author+'</strong></div>'+
            '<div style="text-align: right;">';
        for(var t in val.tags)
            quote += '<a href="#">'+val.tags[t]+'</a> ';
        quote += '</div></div>';
        $('#quotelist').append(quote);
        });
    });
}

/**
 * Handles clicks on author urls in the tag cloud.
 */
function authorClickHandler() {
    var selectedAuthor = $(this).text();
    $('#quotelist').empty();
    $.getJSON('/quotes/author/'+selectedAuthor, function(data) {
        $.each(data, function(key, val) {
        var quote = '<div class="article-container">'+
            '<article style="float: left;">'+
            '<img src="images/quote_start_s.png" style="height: auto; margin-right: 10px; vertical-align: text-top;" />'+
            val.text+
            '<img src="images/quote_end_s.png" style="height: auto; margin-left: 10px; vertical-align: text-bottom;"/>'+
            '</article>'+
            '<div class="article-footer"><strong>'+val.author+'</strong></div>'+
            '<div style="text-align: right;">';
        for(var t in val.tags)
            quote += '<a href="#">'+val.tags[t]+'</a> ';
        quote += '</div></div>';
        $('#quotelist').append(quote);
        });
    });
}

/**
 * Builds tag cloud. Uses either tags or author names, depending
 * on the selected tab
 */
function buildTagCloud() {
    var tag, tagList, weight = 0, htmlTagStr = "";
    if( $(".tab.selected").attr('id').toUpperCase() === "TAGTAB") {
        tagList = getAllTags(); //Synchronous web service call
        $(document).on('click',"#tagcloud a, #quotelist a", tagClickHandler);
    }
    
    if( $(".tab.selected").attr('id').toUpperCase() === "AUTHORTAB")  {
        tagList = getAllAuthors(); //Synchronous web service call
        $(document).on('click',"#tagcloud a, #quotelist a", authorClickHandler);
    }
    
    for(tag in tagList) 
        weight += tagList[tag];

    // Note: Important space at the end of the appended string
    for(tag in tagList)
        htmlTagStr += '<a href="#" rel="'+tagList[tag]+'">'+tag+'</a> ';         
    
    $('#quotelist').empty();
    $('#tagcloud').empty();

    $('#tagcloud').append(htmlTagStr);
    $("#tagcloud a").tagcloud({
        size: {start: 14, end: 18, unit: "pt"},
        color: {start: "#CDE", end: "#F52"}
    });
}

/**
 * jQuery ready() event
 */
$(document).ready(function(){
    buildTagCloud();
    $(document).on('click', ".tab", function() {
        $('#tagcloud').hide();
        $('.tab').removeClass('selected');
        $(this).addClass('selected');
        buildTagCloud();
        $('#tagcloud').fadeIn({"duration": 300});
    });
});
