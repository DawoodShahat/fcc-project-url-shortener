window.onload = function(){
    const urlInput = document.getElementById("url_input");
    const submitBtn = document.querySelector("input[type=submit]");
    const shortenedUrl = document.getElementById("shortened-url");

    submitBtn.addEventListener('click', e => {
        e.preventDefault();
        console.log(urlInput.value);

        fetch('/api/shorturl/new', {
            method: 'post',
            body: JSON.stringify({ "url": urlInput.value }),
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(response => response.json())
        .then(result => {
            console.log(result);
            updateUrl(result);
        });
    });

    function updateUrl(data){
        /* 
            generate that shoretened url --- user shouldn't type it out.
        */
       const fullShortenedUrl = '/api/shorturl/' + data.short_url;
        shortenedUrl.innerText = fullShortenedUrl; 
    }


}