let handleLogin = (element) => {
  FB.login(function(response){
    if (response.status !== 'connected') {
      alert("Login failed");
      return;
    }

    $('#login-form input').val(response.authResponse.accessToken);
    $('#login-form').submit();
  });
}
