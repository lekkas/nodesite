/**********
 * QUOTES *
 **********/
 
exports.setup = function(app, quotes) {
    
    /**
     * Get all tags.
     * Returns set: { "tagName1": tagCount1, "tagName2": tagCount2, ... }
     */
    app.get('/quotes/tags', function(req, res) {
        var tagList = {};
        for(var q in quotes) {
            var tags = quotes[q].tags;
            for(var i in tags) {
                if(tagList[tags[i]] === undefined) 
                    tagList[tags[i]] = 1;
                else
                    tagList[tags[i]] += 1;
            }
        }
        res.json(tagList);
    });
    
    /**
     * Get all author names. 
     * Returns set: { "authorName1": count1, "authorName2": count2, ... }
     */
    app.get('/quotes/authors', function(req, res) {
        var authorList = {};
        for(var q in quotes) {
            var author = quotes[q].author;
            if(authorList[author] === undefined) 
                authorList[author] = 1;
            else
                authorList[author] += 1;
        }
        res.json(authorList);
    });
    
    /**
     * Return quotes with specified tag.
     */
    app.get('/quotes/tag/:tag', function(req, res) {
        var tagQuotes = [];
        var tag = req.params.tag;
        for(var q in quotes) 
        for(var j in quotes[q].tags) 
            if(quotes[q].tags[j].toUpperCase() === tag.toUpperCase()) 
        tagQuotes.push(quotes[q]);
        res.json(tagQuotes);
    });
    
    /**
     * Return quotes with specified author name.
     */
    app.get('/quotes/author/:author', function(req, res) {
        var tagQuotes = [];
        var author = req.params.author;
        for(var q in quotes) 
            for(var j in quotes[q].tags) 
            if(quotes[q].author.toUpperCase() === author.toUpperCase()) 
                tagQuotes.push(quotes[q]);
        res.json(tagQuotes);
    });
}