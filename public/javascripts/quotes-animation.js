(function() {

    var quotes = $(".quotes");
    var quoteIndex = -1;
    
    function showNextQuote() {
        ++quoteIndex;
        quotes.eq(quoteIndex % quotes.length)
            .fadeIn(500)
            .delay(1000)
            .fadeOut(500, showNextQuote);
    }
    
    showNextQuote();
    
})();