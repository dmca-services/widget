// DMCA widget 
 
window.onload = function init() {

    // addStyleSheet();
    addInternalStyles();
    addAzureTableJs();
    addAzureBlobJs();
    createWidgetElements();

    // Login on submit the login form
    document.getElementById("dmca-form-login").addEventListener("submit", function (event) {
        event.preventDefault();

        let email_input = document.getElementById("dmca-login-email").value;
        let password_input = document.getElementById("dmca-login-password").value;
        let error_msg = document.getElementById("dmca-error-login");
        let login_btn = document.getElementById("dmca-btn-login");

        login_btn.disabled = true;
        loading();

        if (email_input == "" || password_input == "") {
            if (email_input == "" && password_input == "") {
                error_msg.innerHTML = "Email and password is required";
            } else if (email_input == "") {
                error_msg.innerHTML = "Please check your email address";
            } else if (password_input == "") {
                error_msg.innerHTML = "Please check your password";
            }
            fadeIn(error_msg);
            login_btn.disabled = false;
            removeLoadingSimple();
        } else {
            const data = {
                email: email_input,
                password: password_input,
            };

            fetch("https://api.dmca.com/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })
                .then((response) => response.json())
                .then((data) => {
                    // console.log(data);
                    if (data == "") {
                        error_msg.innerHTML = "Error login, please check your details and try again.";
                        fadeIn(error_msg);
                        login_btn.disabled = false;
                        removeLoadingSimple();
                    } else {
                        setCookie("dmca_token", data);
                        hide(error_msg);

                        hide(document.getElementById("dmca-form-login"));
                        show(document.getElementById("dmca-menu"));

                        document.getElementById("dmca-widget-content").style.paddingTop = "10px";
                        document.getElementById("dmca-msg-success").innerHTML = "Login Successful!";
                        show(document.getElementById("dmca-wrapper-msg-success"));
                        document.getElementById("dmca-widget-header").classList.add("dmca-tooltip");
                        removeLoading();
                        
                        getAccountId(data, function (response) {
                            if (response != "") {
                                setCookie("dmca_loggedin_account_id", response);
                            }
                        });

                        setTimeout(function () {
                            fadeOut(document.getElementById("dmca-wrapper-msg-success"));

                            loading();
                            
                            if(getCookie(window.location.href) != "") {
                                let json_str = getCookie(window.location.href);
                                let response = JSON.parse(json_str);
                                updateAssetDetails(response);
                            }
                            
                            show(document.getElementById("dmca-wrapper-asset"));
                            
                            removeLoadingSimple();

                        }, 1800);

                    }

                })
                .catch((error) => {
                    console.error("Error: ", error);
                    error_msg.innerHTML = "Error login, please check your details and try again.";
                    fadeIn(error_msg);
                    login_btn.disabled = false;
                    removeLoadingSimple();
                });

        }
    });

    // On click logout button
    document.getElementById("dmca-btn-logout").addEventListener("click", function (event) {
        event.preventDefault();
        
        loading();
        document.cookie = "dmca_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "dmca_loggedin_account_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

        document.getElementById("dmca-login-email").value = "";
        document.getElementById("dmca-login-password").value = "";

        hide(document.getElementById("dmca-menu"));
        hide(document.getElementById("dmca-widget-settings"));
        hide(document.getElementById("dmca-claim-domain"));
        hide(document.getElementById("dmca-form-update-asset"));
        hide(document.getElementById("dmca-site-profile"));
        hide(document.getElementById("dmca-wrapper-asset"));

        document.getElementById("dmca-btn-login").disabled = false;
        show(document.getElementById("dmca-form-login"));
        if (getCookie("dmca_dock_side") == "br" || getCookie("dmca_dock_side") == "bl") {
            hide(document.getElementsByClassName("dmca-up")[0]);
            show(document.getElementsByClassName("dmca-down")[0]);
        } else if (getCookie("dmca_dock_side") == "tr" || getCookie("dmca_dock_side") == "tl") {
            hide(document.getElementsByClassName("dmca-down")[0]);
            show(document.getElementsByClassName("dmca-up")[0]);
        }
        document.getElementById("dmca-widget-header").classList.remove("dmca-tooltip");
        removeLoadingSimple();
    });

    // On click widget settings button
    document.getElementById("dmca-btn-settings").addEventListener("click", function (event) {
        event.preventDefault();
        
        if(getCookie("dmca_validated_" + window.location.hostname) != "true" || getCookie("dmca_account_id") != getCookie("dmca_loggedin_account_id")) {
            hide(document.getElementById("dmca-btn-update"));
            hide(document.getElementById("dmca-btn-protect"));
            hide(document.getElementById("dmca-site-profile"));
            show(document.getElementById("dmca-claim-domain"));
        } else {
            if (getCookie("dmca_dark_theme") == "true") {
                hide(document.getElementById("dmca-btn-dark-theme-off"));
                show(document.getElementById("dmca-btn-dark-theme-on"));
                document.getElementById("dmca-dark-theme-msg").innerHTML = "Dark Theme";
            } else {
                hide(document.getElementById("dmca-btn-dark-theme-on"));
                show(document.getElementById("dmca-btn-dark-theme-off"));
                document.getElementById("dmca-dark-theme-msg").innerHTML = "Light Theme";
            }
    
            if (getCookie("dmca_right_click") == "true") {
                hide(document.getElementById("dmca-btn-right-click-off"));
                show(document.getElementById("dmca-btn-right-click-on"));
                document.getElementById("dmca-right-click-msg").innerHTML = "Enabled";
            } else {
                hide(document.getElementById("dmca-btn-right-click-on"));
                show(document.getElementById("dmca-btn-right-click-off"));
                document.getElementById("dmca-right-click-msg").innerHTML = "Disabled";
            }
    
            if (getCookie("dmca_dock_side") == "br") {
                document.getElementById("dmca-btn-dock-tl").classList.remove("dmca-active");
                document.getElementById("dmca-btn-dock-tr").classList.remove("dmca-active");
                document.getElementById("dmca-btn-dock-bl").classList.remove("dmca-active");
                document.getElementById("dmca-btn-dock-br").classList.add("dmca-active");
            } else if (getCookie("dmca_dock_side") == "bl") {
                document.getElementById("dmca-btn-dock-tl").classList.remove("dmca-active");
                document.getElementById("dmca-btn-dock-tr").classList.remove("dmca-active");
                document.getElementById("dmca-btn-dock-br").classList.remove("dmca-active");
                document.getElementById("dmca-btn-dock-bl").classList.add("dmca-active");
            } else if (getCookie("dmca_dock_side") == "tr") {
                document.getElementById("dmca-btn-dock-tl").classList.remove("dmca-active");
                document.getElementById("dmca-btn-dock-bl").classList.remove("dmca-active");
                document.getElementById("dmca-btn-dock-br").classList.remove("dmca-active");
                document.getElementById("dmca-btn-dock-tr").classList.add("dmca-active");
            } else if (getCookie("dmca_dock_side") == "tl") {
                document.getElementById("dmca-btn-dock-tr").classList.remove("dmca-active");
                document.getElementById("dmca-btn-dock-bl").classList.remove("dmca-active");
                document.getElementById("dmca-btn-dock-br").classList.remove("dmca-active");
                document.getElementById("dmca-btn-dock-tl").classList.add("dmca-active");
            }
    
            if (getCookie("dmca_border_radius") == "lg") {
                document.getElementById("dmca-btn-border-radius-5").classList.remove("dmca-active");
                document.getElementById("dmca-btn-border-radius-0").classList.remove("dmca-active");
                document.getElementById("dmca-btn-border-radius-25").classList.add("dmca-active");
            } else if (getCookie("dmca_border_radius") == "sm") {
                document.getElementById("dmca-btn-border-radius-0").classList.remove("dmca-active");
                document.getElementById("dmca-btn-border-radius-25").classList.remove("dmca-active");
                document.getElementById("dmca-btn-border-radius-5").classList.add("dmca-active");
            } else {
                document.getElementById("dmca-btn-border-radius-5").classList.remove("dmca-active");
                document.getElementById("dmca-btn-border-radius-25").classList.remove("dmca-active");
                document.getElementById("dmca-btn-border-radius-0").classList.add("dmca-active");
            }
    
            hide(document.getElementById("dmca-site-profile"));
            hide(document.getElementById("dmca-form-update-asset"));
            hide(document.getElementById("dmca-claim-domain"));
            if (document.getElementById("dmca-btn-protect").style.display == "none") {
                show(document.getElementById("dmca-btn-update"));
            }
            show(document.getElementById("dmca-widget-settings"));
        }
    });

    // On click widget settings close button
    document.getElementById("dmca-btn-close-widget-settings").addEventListener("click", function () {
        hide(document.getElementById("dmca-widget-settings"));
    });
    
    // On click widget claim close button
    document.getElementById("dmca-btn-close-widget-claim").addEventListener("click", function () {
        hide(document.getElementById("dmca-claim-domain"));
        
        if(document.getElementById("dmca-page-status").innerHTML == "UNPROTECTED") {
            show(document.getElementById("dmca-btn-protect"));
        } else {
            show(document.getElementById("dmca-btn-update"));
        }
        
    });
    
    // On click widget claim button
    document.getElementById("dmca-btn-domain-claim").addEventListener("click", function (event) {
        event.preventDefault();
        let hostname = window.location.hostname;
        let claim_url = "https://www.dmca.com/site-report/ClaimSite.aspx?site=" + hostname.replace("https:", "").replace("http:", "").replace(/\//g, "");
        let target = window.open(claim_url, '_blank');
        target.focus();
    }); 

    // On click widget position bottom right button
    document.getElementById("dmca-btn-dock-br").addEventListener("click", function () {
        if (getCookie("dmca_dock_side") != "br") {

            document.getElementById("dmca-btn-dock-" + getCookie("dmca_dock_side")).classList.remove("dmca-active");
            document.getElementById("dmca-btn-dock-br").classList.add("dmca-active");

            removeWidgetPostion();
            document.getElementById("dmca-widget-wrapper").classList.add("dmca-dock-bottom-right");
            setCookie("dmca_dock_side", "br");
            
            hide(document.getElementsByClassName("dmca-up")[0]);
            show(document.getElementsByClassName("dmca-down")[0]);
            
            changeWidgetWrapperBorderRadius(getCookie("dmca_dock_side"), getCookie("dmca_border_radius"));

            updateWidgetSettings(getCookie("dmca_account_id"), window.location.hostname, getCookie("dmca_dark_theme"), getCookie("dmca_dock_side"), getCookie("dmca_border_radius"), getCookie("dmca_right_click"));

        }
    });

    // On click widget position bottom left button
    document.getElementById("dmca-btn-dock-bl").addEventListener("click", function () {
        if (getCookie("dmca_dock_side") != "bl") {

            document.getElementById("dmca-btn-dock-" + getCookie("dmca_dock_side")).classList.remove("dmca-active");

            document.getElementById("dmca-btn-dock-bl").classList.add("dmca-active");

            removeWidgetPostion();
            document.getElementById("dmca-widget-wrapper").classList.add("dmca-dock-bottom-left");
            setCookie("dmca_dock_side", "bl");
            
            hide(document.getElementsByClassName("dmca-up")[0]);
            show(document.getElementsByClassName("dmca-down")[0]);

            changeWidgetWrapperBorderRadius(getCookie("dmca_dock_side"), getCookie("dmca_border_radius"));
            
            updateWidgetSettings(getCookie("dmca_account_id"), window.location.hostname, getCookie("dmca_dark_theme"), getCookie("dmca_dock_side"), getCookie("dmca_border_radius"), getCookie("dmca_right_click"));

        }
    });

    // On click widget position top left button
    document.getElementById("dmca-btn-dock-tl").addEventListener("click", function () {
        if (getCookie("dmca_dock_side") != "tl") {

            document.getElementById("dmca-btn-dock-" + getCookie("dmca_dock_side")).classList.remove("dmca-active");

            document.getElementById("dmca-btn-dock-tl").classList.add("dmca-active");

            removeWidgetPostion();
            document.getElementById("dmca-widget-wrapper").classList.add("dmca-dock-top-left");
            setCookie("dmca_dock_side", "tl");
            
            hide(document.getElementsByClassName("dmca-down")[0]);
            show(document.getElementsByClassName("dmca-up")[0]);

            changeWidgetWrapperBorderRadius(getCookie("dmca_dock_side"), getCookie("dmca_border_radius"));
            
            updateWidgetSettings(getCookie("dmca_account_id"), window.location.hostname, getCookie("dmca_dark_theme"), getCookie("dmca_dock_side"), getCookie("dmca_border_radius"), getCookie("dmca_right_click"));

        }
    });

    // On click widget position top right button
    document.getElementById("dmca-btn-dock-tr").addEventListener("click", function () {
        if (getCookie("dmca_dock_side") != "tr") {

            document.getElementById("dmca-btn-dock-" + getCookie("dmca_dock_side")).classList.remove("dmca-active");

            document.getElementById("dmca-btn-dock-tr").classList.add("dmca-active");

            removeWidgetPostion();
            document.getElementById("dmca-widget-wrapper").classList.add("dmca-dock-top-right");
            setCookie("dmca_dock_side", "tr");
            
            hide(document.getElementsByClassName("dmca-down")[0]);
            show(document.getElementsByClassName("dmca-up")[0]);

            changeWidgetWrapperBorderRadius(getCookie("dmca_dock_side"), getCookie("dmca_border_radius"));
            
            updateWidgetSettings(getCookie("dmca_account_id"), window.location.hostname, getCookie("dmca_dark_theme"), getCookie("dmca_dock_side"), getCookie("dmca_border_radius"), getCookie("dmca_right_click"));

        }
    });

    // On click widget border radius 0 button
    document.getElementById("dmca-btn-border-radius-0").addEventListener("click", function () {
        if (getCookie("dmca_border_radius") == "sm" || getCookie("dmca_border_radius") == "lg") {
            if (getCookie("dmca_border_radius") == "lg") {
                document.getElementById("dmca-btn-border-radius-25").classList.remove("dmca-active");
            } else {
                document.getElementById("dmca-btn-border-radius-5").classList.remove("dmca-active");
            }
            document.getElementById("dmca-btn-border-radius-0").classList.add("dmca-active");
            removeCurrentBorderRadius(getCookie("dmca_border_radius"), true);
            setCookie("dmca_border_radius", "no");
            updateWidgetSettings(getCookie("dmca_account_id"), window.location.hostname, getCookie("dmca_dark_theme"), getCookie("dmca_dock_side"), getCookie("dmca_border_radius"), getCookie("dmca_right_click"));
        }
    });

    // On click widget border radius 5 button
    document.getElementById("dmca-btn-border-radius-5").addEventListener("click", function () {
        if (getCookie("dmca_border_radius") == "no" || getCookie("dmca_border_radius") == "lg") {
            if (getCookie("dmca_border_radius") == "lg") {
                removeCurrentBorderRadius("lg", false);
                document.getElementById("dmca-btn-border-radius-25").classList.remove("dmca-active");
            } else {
                document.getElementById("dmca-btn-border-radius-0").classList.remove("dmca-active");
            }
            document.getElementById("dmca-btn-border-radius-5").classList.add("dmca-active");
            setCookie("dmca_border_radius", "sm");
            updateWidgetSettings(getCookie("dmca_account_id"), window.location.hostname, getCookie("dmca_dark_theme"), getCookie("dmca_dock_side"), getCookie("dmca_border_radius"), getCookie("dmca_right_click"));
            changeBorderRadius();
        }
    });

    // On click widget border radius 25 button
    document.getElementById("dmca-btn-border-radius-25").addEventListener("click", function () {
        if (getCookie("dmca_border_radius") == "sm" || getCookie("dmca_border_radius") == "no") {
            if (getCookie("dmca_border_radius") == "sm") {
                removeCurrentBorderRadius("sm", false);
                document.getElementById("dmca-btn-border-radius-5").classList.remove("dmca-active");
            } else {
                document.getElementById("dmca-btn-border-radius-0").classList.remove("dmca-active");
            }
            document.getElementById("dmca-btn-border-radius-25").classList.add("dmca-active");
            setCookie("dmca_border_radius", "lg");
            updateWidgetSettings(getCookie("dmca_account_id"), window.location.hostname, getCookie("dmca_dark_theme"), getCookie("dmca_dock_side"), getCookie("dmca_border_radius"), getCookie("dmca_right_click"));
            changeBorderRadius();
        }
    });

    // On click update button
    document.getElementById("dmca-btn-update").addEventListener("click", function () {
        if(getCookie("dmca_validated_" + window.location.hostname) != "true" || getCookie("dmca_account_id") != getCookie("dmca_loggedin_account_id")) {
            hide(document.getElementById("dmca-btn-update"));
            hide(document.getElementById("dmca-btn-protect"));
            hide(document.getElementById("dmca-site-profile"));
            show(document.getElementById("dmca-claim-domain"));
        } else {
            hide(document.getElementById("dmca-btn-update"));
            hide(document.getElementById("dmca-site-profile"));
            hide(document.getElementById("dmca-widget-settings"));
            hide(document.getElementById("dmca-claim-domain"));
            show(document.getElementById("dmca-form-update-asset"));
        }
    });

    // On click update form cancel button
    document.getElementById("dmca-btn-cancel-asset-form").addEventListener("click", function (event) {
        event.preventDefault();
        hide(document.getElementById("dmca-form-update-asset"));
        show(document.getElementById("dmca-btn-update"));
    });

    // On click upload icon
    document.getElementById("dmca-upload").addEventListener("click", function () {
        document.getElementById("dmca-thumbnail-input").click();
    });

    // Click on the thumbnail
    document.getElementById("dmca-thumbnail").addEventListener("click", function () {
        document.getElementById("dmca-thumbnail-input").click();
    });

    // On change the file input 
    document.getElementById("dmca-thumbnail-input").addEventListener("change", function () {
        let file = document.getElementById("dmca-thumbnail-input").files[0];
        uploadBlob(file);
    });

    // On submit update asset form
    document.getElementById("dmca-btn-asset-form").addEventListener("click", function (event) {
        event.preventDefault();

        loading();

        let btn = document.getElementById("dmca-btn-asset-form");

        let token = getCookie("dmca_token");
        let data = {
            url: window.location.href,
            badgeid: getCookie("dmca_account_id"),
            title: document.getElementById("dmca-asset-title").value,
            description: document.getElementById("dmca-asset-description").value,
            type: btn.getAttribute("data-type"),
            status: btn.getAttribute("data-status"),
            thumbnailUrl: document.getElementById("dmca-thumbnail").getAttribute("src")
        };

        fetch("https://api.dmca.com/updateProtectedItem", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Token": token,
            },
            body: JSON.stringify(data),
        })
            .then((response) => response.json())
            .then((data) => {
                updateAssetDetails(data);
                // remove cookie
                document.cookie = window.location.href+"=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

                let succ_el = document.getElementById("dmca-msg-success");
                succ_el.innerHTML = "Updated!";

                hide(document.getElementById("dmca-form-update-asset"));
                show(document.getElementById("dmca-wrapper-msg-success"));
                show(document.getElementById("dmca-btn-update"));
                removeLoading();
                setTimeout(function () {
                    fadeOut(document.getElementById("dmca-wrapper-msg-success"));
                }, 2500);
            })
            .catch((error) => {
                console.log("Update Error: ", error);
                document.getElementById("dmca-msg-error").innerHTML = "ERROR: Please try again later!";
                show(document.getElementById("dmca-wrapper-msg-error"));
                removeLoadingSimple();
                setTimeout(function () {
                    fadeOut(document.getElementById("dmca-wrapper-msg-error"));
                }, 2500);
            });

    });

    // On click protect button
    document.getElementById("dmca-btn-protect").addEventListener("click", function (event) {
        event.preventDefault();
        
        if(getCookie("dmca_account_id") != "") {
            
            loading();
            
            let token = getCookie("dmca_token");
    
            if (document.querySelector('meta[property="og:image"]') != null) {
                var thumbnail = document.querySelector('meta[property="og:image"]').content;
            } else {
                var thumbnail = "https://image.thum.io/get/width/1280/crop/720/maxAge/24/allowJPG/" + window.location.href;
            }
    
            if (thumbnail != undefined) {
                fetch(thumbnail)
                    .then(function (response) {
                        return response.blob();
                    })
                    .then(function (blob) {
                        let blobUri = 'https://dmca.blob.core.windows.net/logos';
                        let SAS = 'st=2019-03-02T00%3A22%3A29Z&se=2028-03-03T00%3A22%3A00Z&sp=rw&sv=2018-03-28&sr=c&sig=5uj40e0WkJN4jO9efLP3CKvstLnc2LG%2BqWfMC6U4Ou0%3D';
                        let blobService = AzureStorage.Blob.createBlobServiceWithSas(blobUri, SAS);
    
                        let customBlockSize = 3000000;
                        blobService.singleBlobPutThresholdInBytes = 3000000;
    
                        let UUID = generateUUID();
                        let imageName = 'PP-Asset-' + UUID + '.jpg';
                        let file = new File([blob], imageName, { type: "image/jpg" });
    
                        let speedSummary = blobService.createBlockBlobFromBrowserFile('internal', imageName, file, { blockSize: customBlockSize }, function (error, result, response) {
                            if (error) {
                                console.log(error);
                            } else {
                                let assetThumbnailUrl = blobUri + '/internal/' + result.name + '?' + SAS;
                             
                                let page_d = document.querySelector('meta[name="description"]');
                                let page_d_content = "";
                                if (page_d) {
                                    page_d_content = page_d.content;
                                }
    
                                let data = {
                                    url: window.location.href,
                                    badgeid: getCookie("dmca_account_id"),
                                    title: document.title,
                                    description: page_d_content,
                                    thumbnailUrl: assetThumbnailUrl,
                                    type: "Page",
                                    status: "Active"
                                };
    
                                fetch("https://api.dmca.com/addProtectedItemAnon", {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                        // "Token": token,
                                    },
                                    body: JSON.stringify(data),
                                })
                                    .then((response) => response.json())
                                    .then((data) => {
                                        updateAssetDetails(data);
    
                                        let succ_el = document.getElementById("dmca-msg-success");
                                        succ_el.innerHTML = "Protected!";
    
                                        show(document.getElementById("dmca-wrapper-msg-success"));
                                        hide(document.getElementById("dmca-btn-protect"));
                                        hide(document.getElementById("dmca-site-profile"));
                                        hide(document.getElementById("dmca-widget-settings"));
                                        hide(document.getElementById("dmca-claim-domain"));
    
                                        updateWidgetStatus(data.status, data.thumbnailUrl, data.title, data.description);
                                        // remove cookie
                                        
                                        document.cookie = window.location.href+"=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    
                                        removeLoading();
                                        setTimeout(function () {
                                            fadeOut(document.getElementById("dmca-wrapper-msg-success"));
                                        }, 2500);
                                    })
                                    .catch((error) => {
                                        console.log("Add Error: ", error);
    
                                        let err_el = document.getElementById("dmca-msg-error");
                                        err_el.innerHTML = "ERROR: Please try again later!";
    
                                        show(document.getElementById("dmca-wrapper-msg-error"));
                                        hide(document.getElementById("dmca-site-profile"));
                                        hide(document.getElementById("dmca-widget-settings"));
                                        hide(document.getElementById("dmca-claim-domain"));
                                        removeLoadingSimple();
                                        setTimeout(function () {
                                            fadeOut(document.getElementById("dmca-wrapper-msg-error"));
                                        }, 2500);
                                    });
                            }
                        });
                    });
            }
        } else if(getCookie("dmca_account_id") == "" && getCookie("dmca_token") != "") {
            hide(document.getElementById("dmca-btn-update"));
            hide(document.getElementById("dmca-btn-protect"));
            hide(document.getElementById("dmca-site-profile"));
            show(document.getElementById("dmca-claim-domain"));
        }

    });

    // Click on dark theme OFF toggle button 
    document.getElementById("dmca-btn-dark-theme-off").addEventListener("click", function () {
        loading();
        hide(document.getElementById("dmca-btn-dark-theme-off"));
        show(document.getElementById("dmca-btn-dark-theme-on"));
        document.getElementById("dmca-dark-theme-msg").innerHTML = "Dark Theme";
        setCookie("dmca_dark_theme", true);
        updateWidgetSettings(getCookie("dmca_account_id"), window.location.hostname, getCookie("dmca_dark_theme"), getCookie("dmca_dock_side"), getCookie("dmca_border_radius"), getCookie("dmca_right_click"));
        darkTheme();
        removeLoadingSimple();
    });

    // Click on dark theme ON toggle button 
    document.getElementById("dmca-btn-dark-theme-on").addEventListener("click", function () {
        loading();
        hide(document.getElementById("dmca-btn-dark-theme-on"));
        show(document.getElementById("dmca-btn-dark-theme-off"));
        document.getElementById("dmca-dark-theme-msg").innerHTML = "Light Theme";
        setCookie("dmca_dark_theme", false);
        updateWidgetSettings(getCookie("dmca_account_id"), window.location.hostname, getCookie("dmca_dark_theme"), getCookie("dmca_dock_side"), getCookie("dmca_border_radius"), getCookie("dmca_right_click"));
        lightTheme();
        removeLoadingSimple();
    });

    // Click on right click disable toggle button 
    document.getElementById("dmca-btn-right-click-off").addEventListener("click", function () {
        loading();
        hide(document.getElementById("dmca-btn-right-click-off"));
        show(document.getElementById("dmca-btn-right-click-on"));
        document.getElementById("dmca-right-click-msg").innerHTML = "Enabled";
        setCookie("dmca_right_click", true);
        updateWidgetSettings(getCookie("dmca_account_id"), window.location.hostname, getCookie("dmca_dark_theme"), getCookie("dmca_dock_side"), getCookie("dmca_border_radius"), getCookie("dmca_right_click"));
        enableRightClick();
        removeLoadingSimple();
    });

    // Click on right click enable toggle button 
    document.getElementById("dmca-btn-right-click-on").addEventListener("click", function () {
        loading();
        hide(document.getElementById("dmca-btn-right-click-on"));
        show(document.getElementById("dmca-btn-right-click-off"));
        document.getElementById("dmca-right-click-msg").innerHTML = "Disabled";
        setCookie("dmca_right_click", false);
        updateWidgetSettings(getCookie("dmca_account_id"), window.location.hostname, getCookie("dmca_dark_theme"), getCookie("dmca_dock_side"), getCookie("dmca_border_radius"), getCookie("dmca_right_click"));
        disableRightClick();
        removeLoadingSimple();
    });

    // Rescan the page
    document.getElementById("dmca-btn-rescan").addEventListener("click", function (event) {
        event.preventDefault();
        loading();

        getProtectedItem(getCookie("dmca_account_id"), window.location.href, function (response) {
            // console.log(response); 
            
            let json_str = JSON.stringify(response);
            setCookie(window.location.href, json_str);

            if (response == "") {
                updateWidgetStatus(null, null, null, null);
            } else {
                updateWidgetStatus(response.status, response.thumbnailUrl, response.title, response.description);
                updateAssetDetails(response);
            }

            hide(document.getElementById("dmca-widget-settings"));
            hide(document.getElementById("dmca-claim-domain"));
            hide(document.getElementById("dmca-site-profile"));
            hide(document.getElementById("dmca-form-update-asset"));
            removeLoading();

            if(response == "") {
                if (getCookie("dmca_account_id") != "") {
                    setTimeout(function () {
                        document.getElementById("dmca-btn-protect").click();
                    }, 1000);
                }
            }

        });

    });

    // View creator profile
    document.getElementById("dmca-btn-creator-profile").addEventListener("click", function (event) {
        event.preventDefault();
        let hostname = window.location.hostname;
        let profile_url = "https://ppro-adder.azurewebsites.net/add/profile.aspx?website=" + hostname.replace("https:", "").replace("http:", "").replace(/\//g, "");
        let target = window.open(profile_url, '_blank');
        target.focus();
    });

    // Add all pages
    document.getElementById("dmca-btn-add-all-pages").addEventListener("click", function (event) {
        event.preventDefault();

        loading();
        
        if(getCookie("dmca_validated_" + window.location.hostname) != "true" || getCookie("dmca_account_id") != getCookie("dmca_loggedin_account_id")) {
            hide(document.getElementById("dmca-btn-update"));
            hide(document.getElementById("dmca-btn-protect"));
            hide(document.getElementById("dmca-site-profile"));
            show(document.getElementById("dmca-claim-domain"));
            removeLoading();
        } else {

            let pages = [];
            pages.push(window.location.href);
    
            for (var i = 0; i < document.links.length; i++) {
                if (document.links[i].hostname == window.location.hostname && !pages.includes(document.links[i].href) && !document.links[i].href.includes("#")) {
                    pages.push(document.links[i].href);
                }
            }
    
            let total_pages = pages.length;
            let count_pages = 0;
            let added_pages = 0;
            let token = getCookie("dmca_token");
            let acc_id = getCookie("dmca_account_id");
    
            pages.map(id => {
    
                let thumbnail = "https://image.thum.io/get/width/1280/crop/720/maxAge/24/allowJPG/" + id;
    
                fetch(thumbnail)
                    .then(function (response) {
                        return response.blob();
                    })
                    .then(function (blob) {
                        let blobUri = 'https://dmca.blob.core.windows.net/logos';
                        let SAS = 'st=2019-03-02T00%3A22%3A29Z&se=2028-03-03T00%3A22%3A00Z&sp=rw&sv=2018-03-28&sr=c&sig=5uj40e0WkJN4jO9efLP3CKvstLnc2LG%2BqWfMC6U4Ou0%3D';
                        let blobService = AzureStorage.Blob.createBlobServiceWithSas(blobUri, SAS);
    
                        let customBlockSize = 3000000;
                        blobService.singleBlobPutThresholdInBytes = 3000000;
    
                        let UUID = generateUUID();
                        let imageName = 'PP-Asset-' + UUID + '.jpg';
                        let file = new File([blob], imageName, { type: "image/jpg" });
    
                        let speedSummary = blobService.createBlockBlobFromBrowserFile('internal', imageName, file, { blockSize: customBlockSize }, function (error, result, response) {
                            if (error) {
                                console.log(error);
                            } else {
                                let assetThumbnailUrl = blobUri + '/internal/' + result.name + '?' + SAS;
    
                                fetch(id)
                                    .then(function (response) {
                                        return response.text();
                                    })
                                    .then(function (body) {
                                        let page_title = body.split('<title>')[1].split('</title>')[0]
    
                                        let data = {
                                            url: id,
                                            badgeid: acc_id,
                                            title: page_title,
                                            description: "",
                                            thumbnailUrl: assetThumbnailUrl,
                                            type: "Page",
                                            status: "Active"
                                        };
    
                                        fetch("https://api.dmca.com/addProtectedItem", {
                                            method: "POST",
                                            headers: {
                                                "Content-Type": "application/json",
                                                "Token": token,
                                            },
                                            body: JSON.stringify(data),
                                        })
                                            .then((response) => response.json())
                                            .then((data) => {
                                                count_pages++;
                                                added_pages++;
                                                if (added_pages == total_pages) {
                                                    protectAllPagesDisplayMsg(count_pages, total_pages);
                                                }
                                            })
                                            .catch((error) => {
                                                console.log("ERROR: ", error);
                                                added_pages++;
                                                if (added_pages == total_pages) {
                                                    protectAllPagesDisplayMsg(count_pages, total_pages);
                                                }
                                            });
    
                                    });
    
                            }
                        });
                    });
    
            });
        }

    });

    // View site profile
    document.getElementById("dmca-btn-site-profile").addEventListener("click", function (event) {
        event.preventDefault();

        loading();

        if (getCookie("dmca_site_object") == "") {
            getSiteObjectByDomain(window.location.hostname, function (response) {
                if (response) {
                    siteProfiledata();
                } else {
                    document.getElementById("dmca-msg-error").innerHTML = "Site Profile is not available.";
                    show(document.getElementById("dmca-wrapper-msg-error"));
                    removeLoading();
                    setTimeout(function() {
                        fadeOut(document.getElementById("dmca-wrapper-msg-error"));
                    }, 2500);
                }

            });
        } else {
            siteProfiledata();
        }

    });

    // On click close site profile button 
    document.getElementById("dmca-btn-close-site-profile").addEventListener("click", function () {
        hide(document.getElementById("dmca-site-profile"));
    });

    // Maximize widget
    document.getElementsByClassName("dmca-up")[0].addEventListener("click", function (event) {
        hide(document.getElementsByClassName("dmca-up")[0]);
        show(document.getElementsByClassName("dmca-down")[0]);
        if (document.getElementById("dmca-widget-content").style.display == "none") {
            document.getElementById("dmca-widget-content").style.display = "flex";
            if(getCookie("dmca_token") != "") {
                show(document.getElementById("dmca-menu"));
            }
        } else {
            hide(document.getElementById("dmca-widget-content"));
            if(getCookie("dmca_token") != "") {
                hide(document.getElementById("dmca-menu"));
            }
        }
    });

    // Minimize widget
    document.getElementsByClassName("dmca-down")[0].addEventListener("click", function (event) {
        hide(document.getElementsByClassName("dmca-down")[0]);
        show(document.getElementsByClassName("dmca-up")[0]);
        if (document.getElementById("dmca-widget-content").style.display == "none") {
            document.getElementById("dmca-widget-content").style.display = "flex";
            if(getCookie("dmca_token") != "") {
                show(document.getElementById("dmca-menu"));
            }
        } else {
            hide(document.getElementById("dmca-widget-content"));
            if(getCookie("dmca_token") != "") {
                hide(document.getElementById("dmca-menu"));
            }
        }
    });

    // Stop right click
    document.getElementsByTagName("body")[0].addEventListener("contextmenu", function (event) {
        if (document.getElementsByTagName("body")[0].classList.contains("dmca-no-right-click")) {
            event.preventDefault();
        }
    });
    
    // Delete page btn click
    document.getElementById("dmca-btn-delete").addEventListener("click", function(event) {
        event.preventDefault();
        loading();
        if(getCookie("dmca_validated_" + window.location.hostname) != "true" || getCookie("dmca_account_id") != getCookie("dmca_loggedin_account_id")) {
            hide(document.getElementById("dmca-btn-update"));
            hide(document.getElementById("dmca-btn-protect"));
            hide(document.getElementById("dmca-site-profile"));
            show(document.getElementById("dmca-claim-domain"));
            removeLoading();
        } else {
            deleteProtectedItem(window.location.href, getCookie("dmca_account_id"), function (response) {
                if(response) {
    
                    let succ_el = document.getElementById("dmca-msg-success");
                    succ_el.innerHTML = "Deleted..!";
    
                    show(document.getElementById("dmca-wrapper-msg-success"));
                    show(document.getElementById("dmca-btn-protect"));
                    hide(document.getElementById("dmca-site-profile"));
                    hide(document.getElementById("dmca-widget-settings"));
                    hide(document.getElementById("dmca-claim-domain"));
                    hide(document.getElementById("dmca-form-update-asset"));
                    hide(document.getElementById("dmca-page-details"));
    
                    updateWidgetStatus(null, null, null, null);
                    // remove cookie
                    document.cookie = window.location.href+"=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    
                    removeLoading();
                    setTimeout(function () {
                        fadeOut(document.getElementById("dmca-wrapper-msg-success"));
                    }, 2500);
                } else {
                    let err_el = document.getElementById("dmca-msg-error");
                    err_el.innerHTML = "ERROR: Please try again later!";
    
                    show(document.getElementById("dmca-wrapper-msg-error"));
                    removeLoadingSimple();
                    setTimeout(function () {
                        fadeOut(document.getElementById("dmca-wrapper-msg-error"));
                    }, 2500);
                }
            });
        }
    });

}

// Create widget elements here
function createWidgetElements() {

    var ele = document.createElement("div");
    ele.id = "dmca-widget-wrapper";
    document.getElementsByTagName("body")[0].appendChild(ele);

    var parent_element = document.getElementById("dmca-widget-wrapper");
    parent_element.classList.add("dmca-bg-white");
    parent_element.classList.add("dmca-text-dark");
    parent_element.classList.add("dmca-change-theme");
    
    var overlay = document.createElement("div");
    overlay.id = "dmca-widget-overlay";
    overlay.classList.add("change-border-radius");
    parent_element.append(overlay);

    var header = document.createElement("div");
    header.id = "dmca-widget-header";
    header.innerHTML = `
    
    <div id="dmca-widget-header-content">
    
        <div class="dmca-header-content1">
            <div id="dmca-logo" class="dmca-text-center dmca-bg-green dmca-text-white dmca-change-border-radius-sl">DMCA</div>
            <div id="dmca-page-status" class="dmca-text-center dmca-text-white dmca-change-border-radius-sl">UNPROTECTED</div>
        </div>
        
        <div class="dmca-header-content2">
            <div id="dmca-verified" class="dmca-text-center dmca-text-white dmca-change-border-radius-sl">VERIFIED</div>
            <div id="dmca-lock" class="dmca-text-center dmca-text-white dmca-change-border-radius-sl">
                <svg data-name="Group 699" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 21.836 32.749"><path data-name="Path 445" d="M.003 31.665c0-6.479-.013-13.107.013-19.735 0-1.082.731-1.57 1.772-1.571q9.124-.01 18.249 0c1.252 0 1.8.712 1.8 1.936q-.015 9.242 0 18.484a1.759 1.759 0 0 1-2 1.955c-5.963.019-11.927.009-17.891 0a2.171 2.171 0 0 1-1.943-1.069zm8.1-5.064h5.518l-1.213-5c1.488-2.057 1.59-3.392.356-4.506a2.61 2.61 0 0 0-3.576-.186c-1.4 1.011-1.343 2.332.137 4.859z" fill="#fff"></path><path data-name="Path 446" d="M19.228 8.516h-2.665c-1.1-2.753-2.084-5.8-5.859-5.7-3.559.1-4.48 3-5.51 5.7H2.701C2.626 4.571 6.161.408 9.858.038c4.686-.462 8.185 2.645 9.37 8.478z" fill="#fff"></path><path data-name="Path 447" d="M8.106 26.598l1.221-4.833c-1.48-2.527-1.533-3.848-.137-4.859a2.61 2.61 0 0 1 3.576.186c1.234 1.114 1.132 2.449-.356 4.506l1.213 5z" fill="rgba(0, 0, 0, 0)"></path></svg>
            </div>
            <div id="dmca-menu" class="dmca-bg-dark dmca-change-border-radius-sl">
                <div class="dmca-bar dmca-bg-white dmca-change-border-radius-sl"></div>
                <div class="dmca-bar dmca-bg-white dmca-change-border-radius-sl"></div>
                <div class="dmca-bar dmca-bg-white dmca-change-border-radius-sl"></div>
                <div id="dmca-menu-content" class="dmca-bg-white dmca-change-theme-bg dmca-change-border-radius-sl">
                    <a href="#" id="dmca-btn-rescan" class="dmca-text-dark dmca-change-theme-text">Rescan</a>
                    <a href="#" id="dmca-btn-delete" class="dmca-text-dark dmca-change-theme-text">Delete Page</a>
                    <a href="#" id="dmca-btn-site-profile" class="dmca-text-dark dmca-change-theme-text">Site Profile</a>
                    <a href="#" id="dmca-btn-add-all-pages" class="dmca-text-dark dmca-change-theme-text">Add all pages</a>
                    <a href="#" id="dmca-btn-creator-profile" class="dmca-text-dark dmca-change-theme-text">Creator Profile</a>
                    <a href="#" id="dmca-btn-settings" class="dmca-text-dark dmca-change-theme-text">Widget Settings</a>
                    <a href="#" id="dmca-btn-logout" class="dmca-text-dark dmca-change-theme-text">Logout</a>
                </div>
            </div>
            <div id="dmca-min-max-arrows" class="dmca-change-border-radius-sl dmca-bg-dark">
                <svg class="dmca-arrow dmca-up dmca-icon" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="16px" height="16px" viewBox="0 0 451.847 451.846" style="enable-background:new 0 0 451.847 451.846;" xml:space="preserve"><g><path d="M248.292,106.406l194.281,194.29c12.365,12.359,12.365,32.391,0,44.744c-12.354,12.354-32.391,12.354-44.744,0 L225.923,173.529L54.018,345.44c-12.36,12.354-32.395,12.354-44.748,0c-12.359-12.354-12.359-32.391,0-44.75L203.554,106.4 c6.18-6.174,14.271-9.259,22.369-9.259C234.018,97.141,242.115,100.232,248.292,106.406z"/></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g></svg>
                <svg class="dmca-arrow dmca-down dmca-icon" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="16px" height="16px" viewBox="0 0 451.847 451.847" style="enable-background:new 0 0 451.847 451.847;" xml:space="preserve"><g><path d="M225.923,354.706c-8.098,0-16.195-3.092-22.369-9.263L9.27,151.157c-12.359-12.359-12.359-32.397,0-44.751 c12.354-12.354,32.388-12.354,44.748,0l171.905,171.915l171.906-171.909c12.359-12.354,32.391-12.354,44.744,0 c12.365,12.354,12.365,32.392,0,44.751L248.292,345.449C242.115,351.621,234.018,354.706,225.923,354.706z"/></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g></svg>
            </div>
        </div>
        
    </div>
    
    <span id="dmca-tooltiptext" class="change-border-radius">Only logged in user is able to see these details in the widget.</span>
    
    <div id="dmca-loader" class="dmca-loader-no">
        <span class="dmca-bg-green"></span>
        <span class="dmca-bg-gray"></span>
        <span class="dmca-bg-green"></span>
    </div>
    
    <svg id="dmca-icon-star" width="20px" height="20px" viewBox="0 0 362.62 388.52">
        <path d="M156.58,239l-88.3,64.75c-10.59,7.06-18.84,11.77-29.43,11.77-21.19,0-38.85-18.84-38.85-40C0,257.83,14.13,244.88,27.08,239l103.6-44.74L27.08,148.34C13,142.46,0,129.51,0,111.85,0,90.66,18.84,73,40,73c10.6,0,17.66,3.53,28.25,11.77l88.3,64.75L144.81,44.74C141.28,20,157.76,0,181.31,0s40,18.84,36.5,43.56L206,149.52l88.3-64.75C304.93,76.53,313.17,73,323.77,73a39.2,39.2,0,0,1,38.85,38.85c0,18.84-12.95,30.61-27.08,36.5L231.93,194.26,335.54,239c14.13,5.88,27.08,18.83,27.08,37.67,0,21.19-18.84,38.85-40,38.85-9.42,0-17.66-4.71-28.26-11.77L206,239l11.77,104.78c3.53,24.72-12.95,44.74-36.5,44.74s-40-18.84-36.5-43.56Z"></path>
    </svg>
`;
    parent_element.append(header);

    var content = document.createElement("div");
    content.id = "dmca-widget-content";
    content.innerHTML = `
    
    <div id="dmca-wrapper-msg-success">
        <p id="dmca-msg-success" class="dmca-text-green dmca-text-center dmca-text-bold dmca-text-shadow">Success</p>
    </div>
        
    <div id="dmca-wrapper-msg-error">
        <p id="dmca-msg-error" class="dmca-text-red dmca-text-center dmca-text-shadow">Error</p>
    </div>
    
    <div id="dmca-page-details" class="change-border-radius dmca-border-dark dmca-bg-white dmca-change-theme-bg dmca-change-theme-border">
        <img id="dmca-page-thumbnail" src="https://ppro-adder.azurewebsites.net/PP2020/images/temp/page-placeholder.png" alt="Page thumbnail" class="change-border-radius dmca-border-dark dmca-change-theme-border">
        <div>
            <h5 id="dmca-page-title" class="dmca-text-dark dmca-change-theme-text"></h5>
            <p id="dmca-page-description" class="dmca-text-dark dmca-change-theme-text"></p>
        </div>
    </div>
    
    <form id="dmca-form-login" class="change-border-radius dmca-border-dark dmca-change-theme dmca-text-dark dmca-bg-white dmca-change-theme-border">
        <h4 class="dmca-title dmca-text-center dmca-text-dark  dmca-change-theme-text">LOG IN</h4>
        <lable class="dmca-text-red dmca-text-center" id="dmca-error-login">Error login, please check your details and try again.</lable>
        
        <div class="dmca-input-wrapper">
            <div class="dmca-icon_email">
                <svg xmlns="http://www.w3.org/2000/svg" width="23.931" height="23.931" viewBox="0 0 24.931 24.931">
                    <path data-name="Oval 255" d="M10.907 13.61a3.106 3.106 0 0 1-1.558-2.7V7.788a3.116 3.116 0 0 1 6.233 0v3.122a3.115 3.115 0 0 1-1.558 2.7v1.976h2.337a2.008 2.008 0 0 1 2.314 1.9 8.326 8.326 0 0 1-12.419 0 2.008 2.008 0 0 1 2.314-1.9h2.337zm1.558 8.2a9.349 9.349 0 1 0-9.349-9.349 9.349 9.349 0 0 0 9.349 9.353zm0 3.116A12.465 12.465 0 1 1 24.93 12.461a12.465 12.465 0 0 1-12.465 12.47zm0 0" fill="#CBCBCB" fill-rule="evenodd"></path>
                </svg>
            </div>
            <input type="text" name="email" class="dmca-input change-border-radius dmca-text-dark dmca-bg-white dmca-change-theme" id="dmca-login-email" placeholder="Email Address">
        </div>
        
        <div class="dmca-input-wrapper">
            <div class="dmca-icon_pwd">
                <svg xmlns="http://www.w3.org/2000/svg" width="21.593" height="21.393" viewBox="0 0 21.593 22.393">
                    <path data-name="Path 401" d="M5.6 8a7.951 7.951 0 0 0 .718 3.281L0 17.594v2.4c0 1.324 1.433 2.4 3.2 2.4h3.2v-3.2h3.2v-3.2h4a8 8 0 1 0-8-8zm8 3.2A3.2 3.2 0 1 1 16.8 8a3.2 3.2 0 0 1-3.2 3.2z" fill="#CBCBCB"></path>
                </svg>
            </div>
            <input type="password" name="password" class="dmca-input change-border-radius dmca-text-dark dmca-bg-white dmca-change-theme" id="dmca-login-password" placeholder="Password">
        </div>
        
        <button class="dmca-btn dmca-btn-green change-border-radius dmca-text-center" id="dmca-btn-login">LOGIN</button>
    </form>
    
    <div id="dmca-wrapper-asset">
        
        <button class="dmca-btn dmca-btn-green change-border-radius dmca-text-center" id="dmca-btn-protect">PROTECT PAGE</button>
        <button class="dmca-btn dmca-btn-dark-outline change-border-radius dmca-text-center dmca-change-theme-btn-o" id="dmca-btn-update">UPDATE</button>
        
        <form id="dmca-form-update-asset" class="change-border-radius dmca-border-dark dmca-bg-white  dmca-change-theme-bg dmca-change-theme-border">
            
            <div class="dmca-input-wrapper">
                <lable for="title">Title</lable>
                <input type="text" name="title" class="dmca-input change-border-radius dmca-text-dark dmca-bg-white dmca-change-theme" id="dmca-asset-title" placeholder="Title">
            </div>
            
            <div class="dmca-input-wrapper">
                <lable for="description">Description</lable>
                <textarea name="description" class="dmca-textarea change-border-radius dmca-text-dark dmca-bg-white dmca-change-theme" id="dmca-asset-description" rows="3" placeholder="Description"></textarea>
            </div>
            
            
            <p id="dmca-file-error">File size is too large, please try again with a image under 500kb in size.</p>
            
            <div class="dmca-input-wrapper">
                <img src="" alt="thumbnail image" id="dmca-thumbnail" class="change-border-radius">
                
                <svg id="dmca-upload" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512.056 512.056" style="enable-background:new 0 0 512.056 512.056;" xml:space="preserve"><g><g><g><path d="M426.635,188.224C402.969,93.946,307.358,36.704,213.08,60.37C139.404,78.865,85.907,142.542,80.395,218.303 C28.082,226.93-7.333,276.331,1.294,328.644c7.669,46.507,47.967,80.566,95.101,80.379h80v-32h-80c-35.346,0-64-28.654-64-64 c0-35.346,28.654-64,64-64c8.837,0,16-7.163,16-16c-0.08-79.529,64.327-144.065,143.856-144.144 c68.844-0.069,128.107,48.601,141.424,116.144c1.315,6.744,6.788,11.896,13.6,12.8c43.742,6.229,74.151,46.738,67.923,90.479 c-5.593,39.278-39.129,68.523-78.803,68.721h-64v32h64c61.856-0.187,111.848-50.483,111.66-112.339 C511.899,245.194,476.655,200.443,426.635,188.224z"/><path d="M245.035,253.664l-64,64l22.56,22.56l36.8-36.64v153.44h32v-153.44l36.64,36.64l22.56-22.56l-64-64 C261.354,247.46,251.276,247.46,245.035,253.664z"/></g></g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g></svg>
                
                <input type="file" id="dmca-thumbnail-input">
            </div>
            
            <button class="dmca-btn dmca-btn-green change-border-radius dmca-text-center" id="dmca-btn-asset-form" form="form-update-asset" type="submit">UPDATE</button>
            <button class="dmca-btn dmca-btn-dark-outline change-border-radius dmca-text-center dmca-change-theme-btn-o" id="dmca-btn-cancel-asset-form">CLOSE</button>
            
        </form>
        
        <div id="dmca-site-profile" class="change-border-radius dmca-border-dark dmca-bg-white  dmca-change-theme-bg dmca-change-theme-border">
            <h4 class="dmca-title dmca-text-center dmca-text-dark dmca-change-theme-text">SITE PROFILE</h2>
            
            <p class="dmca-text-dark dmca-change-theme-text dmca-border-bottom"><i>Compliance Status: </i><span id="dmca-profile-status" class="dmca-text-bold dmca-text-green">Not set</span></p>
            <p class="dmca-text-dark dmca-change-theme-text dmca-border-bottom"><i>This site is owned & operated by: </i><br><span id="dmca-profile-owned" class="dmca-text-bold"></span></p>
            <p class="dmca-text-dark dmca-change-theme-text dmca-border-bottom"><i>Site report was first generated on: </i><br><span id="dmca-profile-generated-on" class="dmca-text-bold"></span></p>
            <p class="dmca-text-dark dmca-change-theme-text dmca-border-bottom"><i>Site report was last updated on: </i><br><span id="dmca-profile-updated-on" class="dmca-text-bold"></span></p>
            <p class="dmca-text-dark dmca-change-theme-text dmca-border-bottom"><i>Site ID: </i><br><span id="dmca-profile-id" class="dmca-text-bold"></span></p>
            
            <p class="dmca-text-dark dmca-change-theme-text"><i>Screenshot</i></p>
            <img src="https://dmca.blob.core.windows.net/logos/internal/PP-Asset-db1a951f-ceb9-4e29-b31e-6f0371d25437.jpg?st=2019-03-02T00%3A22%3A29Z&se=2028-03-03T00%3A22%3A00Z&sp=rw&sv=2018-03-28&sr=c&sig=5uj40e0WkJN4jO9efLP3CKvstLnc2LG%2BqWfMC6U4Ou0%3D" alt="thumbnail image" id="dmca-profile-screenshot" class="change-border-radius">
            
            <p class="dmca-text-center">
                <a href="#" target="_blank" id="dmca-profile-fb" class="dmca-text-white dmca-change-theme-text">
                    <svg version="1.1" height="20pt" width="20pt" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 167.657 167.657" style="enable-background:new 0 0 167.657 167.657;" xml:space="preserve"><g><path style="fill:#010002;" d="M83.829,0.349C37.532,0.349,0,37.881,0,84.178c0,41.523,30.222,75.911,69.848,82.57v-65.081H49.626 v-23.42h20.222V60.978c0-20.037,12.238-30.956,30.115-30.956c8.562,0,15.92,0.638,18.056,0.919v20.944l-12.399,0.006 c-9.72,0-11.594,4.618-11.594,11.397v14.947h23.193l-3.025,23.42H94.026v65.653c41.476-5.048,73.631-40.312,73.631-83.154 C167.657,37.881,130.125,0.349,83.829,0.349z"/></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g></svg>
                </a>
                <a href="#" target="_blank" id="dmca-profile-twitter" class="dmca-text-white dmca-change-theme-text">
                    <svg height="20pt" viewBox="0 0 512 512" width="20pt" xmlns="http://www.w3.org/2000/svg"><path d="m256 0c-141.363281 0-256 114.636719-256 256s114.636719 256 256 256 256-114.636719 256-256-114.636719-256-256-256zm116.886719 199.601562c.113281 2.519532.167969 5.050782.167969 7.59375 0 77.644532-59.101563 167.179688-167.183594 167.183594h.003906-.003906c-33.183594 0-64.0625-9.726562-90.066406-26.394531 4.597656.542969 9.277343.8125 14.015624.8125 27.53125 0 52.867188-9.390625 72.980469-25.152344-25.722656-.476562-47.410156-17.464843-54.894531-40.8125 3.582031.6875 7.265625 1.0625 11.042969 1.0625 5.363281 0 10.558593-.722656 15.496093-2.070312-26.886718-5.382813-47.140624-29.144531-47.140624-57.597657 0-.265624 0-.503906.007812-.75 7.917969 4.402344 16.972656 7.050782 26.613281 7.347657-15.777343-10.527344-26.148437-28.523438-26.148437-48.910157 0-10.765624 2.910156-20.851562 7.957031-29.535156 28.976563 35.554688 72.28125 58.9375 121.117187 61.394532-1.007812-4.304688-1.527343-8.789063-1.527343-13.398438 0-32.4375 26.316406-58.753906 58.765625-58.753906 16.902344 0 32.167968 7.144531 42.890625 18.566406 13.386719-2.640625 25.957031-7.53125 37.3125-14.261719-4.394531 13.714844-13.707031 25.222657-25.839844 32.5 11.886719-1.421875 23.214844-4.574219 33.742187-9.253906-7.863281 11.785156-17.835937 22.136719-29.308593 30.429687zm0 0"/></svg>
                </a>
                <a href="#" target="_blank" id="dmca-profile-linkedin" class="dmca-text-white dmca-change-theme-text">
                    <svg height="20pt" viewBox="0 0 512 512" width="20pt" xmlns="http://www.w3.org/2000/svg"><path d="m256 0c-141.363281 0-256 114.636719-256 256s114.636719 256 256 256 256-114.636719 256-256-114.636719-256-256-256zm-74.390625 387h-62.347656v-187.574219h62.347656zm-31.171875-213.1875h-.40625c-20.921875 0-34.453125-14.402344-34.453125-32.402344 0-18.40625 13.945313-32.410156 35.273437-32.410156 21.328126 0 34.453126 14.003906 34.859376 32.410156 0 18-13.53125 32.402344-35.273438 32.402344zm255.984375 213.1875h-62.339844v-100.347656c0-25.21875-9.027343-42.417969-31.585937-42.417969-17.222656 0-27.480469 11.601563-31.988282 22.800781-1.648437 4.007813-2.050781 9.609375-2.050781 15.214844v104.75h-62.34375s.816407-169.976562 0-187.574219h62.34375v26.558594c8.285157-12.78125 23.109375-30.960937 56.1875-30.960937 41.019531 0 71.777344 26.808593 71.777344 84.421874zm0 0"/></svg>
                </a>
            </p>
            
            <button class="dmca-btn dmca-btn-dark-outline change-border-radius dmca-text-center dmca-change-theme-btn-o" id="dmca-btn-close-site-profile">CLOSE</button>
            
        </div>
        
        <div id="dmca-widget-settings" class="change-border-radius dmca-border-dark dmca-bg-white  dmca-change-theme-bg dmca-change-theme-border">
            <h4 class="dmca-title dmca-text-center dmca-text-dark dmca-change-theme-text">WIDGET SETTINGS</h4>
            
            <h5 class="dmca-title dmca-text-center dmca-text-dark dmca-change-theme-text">THEME</h5>
            <p class="dmca-text-center dmca-widget-theme dmca-text-dark dmca-change-theme-text">
                <span id="dmca-btn-dark-theme-on">
                    <svg class="dmca-icon" height="20pt" viewBox="0 -107 512 512" width="20pt" xmlns="http://www.w3.org/2000/svg"><path d="m0 149.332031c0 82.347657 67.007812 149.335938 149.332031 149.335938h213.335938c82.324219 0 149.332031-66.988281 149.332031-149.335938 0-82.34375-67.007812-149.332031-149.332031-149.332031h-213.335938c-82.324219 0-149.332031 66.988281-149.332031 149.332031zm277.332031 0c0-47.058593 38.273438-85.332031 85.335938-85.332031 47.058593 0 85.332031 38.273438 85.332031 85.332031 0 47.0625-38.273438 85.335938-85.332031 85.335938-47.0625 0-85.335938-38.273438-85.335938-85.335938zm0 0"/></svg>
                </span>
                <span id="dmca-btn-dark-theme-off">
                    <svg class="dmca-icon" height="20pt" viewBox="0 -107 512 512" width="20pt" xmlns="http://www.w3.org/2000/svg"><path d="m362.667969 298.667969h-213.335938c-82.34375 0-149.332031-67.007813-149.332031-149.335938 0-82.324219 66.988281-149.332031 149.332031-149.332031h213.335938c82.34375 0 149.332031 67.007812 149.332031 149.332031 0 82.328125-66.988281 149.335938-149.332031 149.335938zm-213.335938-266.667969c-64.703125 0-117.332031 52.652344-117.332031 117.332031 0 64.683594 52.628906 117.335938 117.332031 117.335938h213.335938c64.703125 0 117.332031-52.652344 117.332031-117.335938 0-64.679687-52.628906-117.332031-117.332031-117.332031zm0 0"/><path d="m149.332031 234.667969c-47.058593 0-85.332031-38.273438-85.332031-85.335938 0-47.058593 38.273438-85.332031 85.332031-85.332031 47.0625 0 85.335938 38.273438 85.335938 85.332031 0 47.0625-38.273438 85.335938-85.335938 85.335938zm0-138.667969c-29.394531 0-53.332031 23.914062-53.332031 53.332031 0 29.421875 23.9375 53.335938 53.332031 53.335938 29.398438 0 53.335938-23.914063 53.335938-53.335938 0-29.417969-23.9375-53.332031-53.335938-53.332031zm0 0"/></svg>
                </span>
                <span id="dmca-dark-theme-msg">Light Theme</span>
            </p>
            
            <h5 class="dmca-title dmca-text-center dmca-text-dark dmca-change-theme-text">RIGHT CLICK</h5>
            <p class="dmca-text-center dmca-widget-theme dmca-text-dark dmca-change-theme-text">
                <span id="dmca-btn-right-click-on">
                    <svg class="dmca-icon" height="20pt" viewBox="0 -107 512 512" width="20pt" xmlns="http://www.w3.org/2000/svg"><path d="m0 149.332031c0 82.347657 67.007812 149.335938 149.332031 149.335938h213.335938c82.324219 0 149.332031-66.988281 149.332031-149.335938 0-82.34375-67.007812-149.332031-149.332031-149.332031h-213.335938c-82.324219 0-149.332031 66.988281-149.332031 149.332031zm277.332031 0c0-47.058593 38.273438-85.332031 85.335938-85.332031 47.058593 0 85.332031 38.273438 85.332031 85.332031 0 47.0625-38.273438 85.335938-85.332031 85.335938-47.0625 0-85.335938-38.273438-85.335938-85.335938zm0 0"/></svg>
                </span>
                <span id="dmca-btn-right-click-off">
                    <svg class="dmca-icon" height="20pt" viewBox="0 -107 512 512" width="20pt" xmlns="http://www.w3.org/2000/svg"><path d="m362.667969 298.667969h-213.335938c-82.34375 0-149.332031-67.007813-149.332031-149.335938 0-82.324219 66.988281-149.332031 149.332031-149.332031h213.335938c82.34375 0 149.332031 67.007812 149.332031 149.332031 0 82.328125-66.988281 149.335938-149.332031 149.335938zm-213.335938-266.667969c-64.703125 0-117.332031 52.652344-117.332031 117.332031 0 64.683594 52.628906 117.335938 117.332031 117.335938h213.335938c64.703125 0 117.332031-52.652344 117.332031-117.335938 0-64.679687-52.628906-117.332031-117.332031-117.332031zm0 0"/><path d="m149.332031 234.667969c-47.058593 0-85.332031-38.273438-85.332031-85.335938 0-47.058593 38.273438-85.332031 85.332031-85.332031 47.0625 0 85.335938 38.273438 85.335938 85.332031 0 47.0625-38.273438 85.335938-85.335938 85.335938zm0-138.667969c-29.394531 0-53.332031 23.914062-53.332031 53.332031 0 29.421875 23.9375 53.335938 53.332031 53.335938 29.398438 0 53.335938-23.914063 53.335938-53.335938 0-29.417969-23.9375-53.332031-53.335938-53.332031zm0 0"/></svg>
                </span>
                <span id="dmca-right-click-msg">Enabled</span>
            </p>
            
            <h5 class="dmca-title dmca-text-center dmca-text-dark dmca-change-theme-text">WIDGET POSITION</h5>
            <p class="dmca-widget-dock dmca-text-center dmca-text-dark dmca-change-theme-text">
                <span id="dmca-btn-dock-bl" class="dmca-bg-white" title="Bottom left corner">
                    <i class="dmca-dot dmca-bg-dark"></i>
                </span>
                <span id="dmca-btn-dock-br" class="dmca-bg-white" title="Bottom right corner">
                    <i class="dmca-dot dmca-bg-dark"></i>
                </span>
                <span id="dmca-btn-dock-tl" class="dmca-bg-white" title="Top left corner">
                    <i class="dmca-dot dmca-bg-dark"></i>
                </span>
                <span id="dmca-btn-dock-tr" class="dmca-bg-white" title="Top right corner">
                    <i class="dmca-dot dmca-bg-dark"></i>
                </span>
            </p>
            
            <h5 class="dmca-title dmca-text-center dmca-text-dark dmca-change-theme-text">WIDGET BORDER STYLES</h5>
            <p class="dmca-widget-border-radius dmca-text-center dmca-text-dark dmca-change-theme-text">
                <span id="dmca-btn-border-radius-0" class="dmca-bg-white" title="Sharp edges">
                </span>
                <span id="dmca-btn-border-radius-5" class="dmca-bg-white dmca-border-radius-sm" title="Small rounded corners">
                </span>
                <span id="dmca-btn-border-radius-25" class="dmca-bg-white dmca-border-radius-lg" title="Rounded corners">
                </span>
            </p>
            
            <button class="dmca-btn dmca-btn-dark-outline change-border-radius dmca-text-center dmca-change-theme-btn-o" id="dmca-btn-close-widget-settings">CLOSE</button>
            
        </div>
        
        <div id="dmca-claim-domain" class="change-border-radius dmca-border-dark dmca-bg-white  dmca-change-theme-bg dmca-change-theme-border">
            <h4 class="dmca-title dmca-text-center dmca-text-red">DOMAIN MUST BE CLAIMED AND VALIDATED</h4>
            
            <p class="dmca-text-center dmca-widget-theme dmca-text-dark dmca-change-theme-text">
                Once you validate that you own/control the site, you can add protection
            </p>
            
            <button class="dmca-btn dmca-btn-green change-border-radius dmca-text-center" id="dmca-btn-domain-claim">CLAIM AND VALIDATE</button>
            <button class="dmca-btn dmca-btn-dark-outline change-border-radius dmca-text-center dmca-change-theme-btn-o" id="dmca-btn-close-widget-claim">CLOSE</button>
            
        </div>
        
    </div>
`;
    parent_element.appendChild(content);

    content.classList.add("dmca-bg-white");
    content.classList.add("dmca-text-dark");
    content.classList.add("dmca-change-theme");

    if (getCookie("dmca_token") == "") {

        if (getCookie("dmca_dock_side") == "" || getCookie("dmca_website") != window.location.hostname) {
            
            if (getCookie("dmca_site_object") == "" || getCookie("dmca_website") != window.location.hostname) {
                getSiteObjectByDomain(window.location.hostname, function (res) {
                    
                    
                    if(res) {
                    
                        if(getCookie("dmca_account_id") == "") {
                            getWidgetSettings(window.location.hostname, function (response) {
                                getInitWidgetSettings(response);
                            });
                        } else {
                            getWidgetSettingsByAccountId(getCookie("dmca_account_id"), window.location.hostname, function (response) {
                                getInitWidgetSettings(response);
                            });
                        }
                    
                    } else {
                        // console.log(res);
                        
                        getWidgetSettings(window.location.hostname, function (response) {
                            getInitWidgetSettings(response);
                        });
                    }
                
                });
            }

        } else {
            if (getCookie("dmca_dock_side") == "br" || getCookie("dmca_dock_side") == "bl") {
                hide(document.getElementsByClassName("dmca-down")[0]);
                show(document.getElementsByClassName("dmca-up")[0]);
            } else if (getCookie("dmca_dock_side") == "tr" || getCookie("dmca_dock_side") == "tl") {
                hide(document.getElementsByClassName("dmca-up")[0]);
                show(document.getElementsByClassName("dmca-down")[0]);
            }
            
            if(getCookie("dmca_account_id") != "") {
                if(getCookie(window.location.href) != "") {
                    processItemStatus(false);
                } else {
                    getProtectedItem(getCookie("dmca_account_id"), window.location.href, function (response) {
                        // console.log(response); 
                        
                        let json_str = JSON.stringify(response);
                        setCookie(window.location.href, json_str);
                        processItemStatus(false);
                        
                    });
                }
            } else {
                processItemStatus(false);
            }
            
        }

    } else {
        loading();
        
        if (getCookie("dmca_dock_side") == "br" || getCookie("dmca_dock_side") == "bl") {
            hide(document.getElementsByClassName("dmca-down")[0]);
            show(document.getElementsByClassName("dmca-up")[0]);
        } else if (getCookie("dmca_dock_side") == "tr" || getCookie("dmca_dock_side") == "tl") {
            hide(document.getElementsByClassName("dmca-up")[0]);
            show(document.getElementsByClassName("dmca-down")[0]);
        }

        document.getElementById("dmca-widget-header").classList.add("dmca-tooltip");
        
        if(getCookie(window.location.href) != "") {
            processItemStatus(true);
        } else {
            getProtectedItem(getCookie("dmca_account_id"), window.location.href, function (response) {
                // console.log(response); 
                
                let json_str = JSON.stringify(response);
                setCookie(window.location.href, json_str);
                processItemStatus(true);
                
            });
        }

    }

}

// Get widget settings at the begining
function getInitWidgetSettings(is_settings) {
    
    if (is_settings) {
        if (getCookie("dmca_dock_side") == "br" || getCookie("dmca_dock_side") == "bl") {
            hide(document.getElementsByClassName("dmca-down")[0]);
            show(document.getElementsByClassName("dmca-up")[0]);
        } else if (getCookie("dmca_dock_side") == "tr" || getCookie("dmca_dock_side") == "tl") {
            hide(document.getElementsByClassName("dmca-up")[0]);
            show(document.getElementsByClassName("dmca-down")[0]);
        }
    } else {
        hide(document.getElementsByClassName("dmca-down")[0]);
        show(document.getElementsByClassName("dmca-up")[0]);
    }
    
    if(getCookie("dmca_account_id") != "") {
        if(getCookie(window.location.href) != "") {
            processItemStatus(false);
        } else {
            getProtectedItem(getCookie("dmca_account_id"), window.location.href, function (response) {
                // console.log(response); 
                
                let json_str = JSON.stringify(response);
                setCookie(window.location.href, json_str);
                processItemStatus(false);
                
            });
        }
    } else {
        processItemStatus(false);
    }
    
}

// Process page status here
function processItemStatus(is_login) {
    
    if(getCookie("dmca_account_id") != "") {
        var json_str = getCookie(window.location.href);
        var response = JSON.parse(json_str);
    } else {
        var response = "";
    }
    
    if (response == "") {
        updateWidgetStatus(null, null, null, null);
    } else {
        updateWidgetStatus(response.status, response.thumbnailUrl, response.title, response.description);
        if (is_login) {
            updateAssetDetails(response);
        }
    }

    if (is_login) {
        hide(document.getElementById("dmca-widget-content"));
        show(document.getElementById("dmca-wrapper-asset"));

        removeLoadingSimple();

        showWidgetWrapper();

    } else {

        hide(document.getElementById("dmca-widget-content"));
        show(document.getElementById("dmca-form-login"));

        showWidgetWrapper();

        if (window.location.hostname != getCookie("dmca_website")) {
            setCookie("dmca_website", window.location.hostname);
        }
    }
    
    if(getCookie("dmca_account_id") != "" && response == "") {
        setTimeout(function () {
            document.getElementById("dmca-btn-protect").click();
        }, 1000);
    }
    
}

// Show widget wrapper
function showWidgetWrapper() {
    let widget_wrapper = document.getElementById("dmca-widget-wrapper");

    updateWidgetTheme();

    show(widget_wrapper);
}

// Update widget wrapper theme
function updateWidgetTheme() {
    let widget_wrapper = document.getElementById("dmca-widget-wrapper");
    
    if (getCookie("dmca_dock_side") == "bl") {
        widget_wrapper.classList.add("dmca-dock-bottom-left");
        widget_wrapper.classList.remove("dmca-dock-top-left");
        widget_wrapper.classList.remove("dmca-dock-top-right");
        widget_wrapper.classList.remove("dmca-dock-bottom-right");
    } else if (getCookie("dmca_dock_side") == "tl") {
        widget_wrapper.classList.add("dmca-dock-top-left");
        widget_wrapper.classList.remove("dmca-dock-bottom-left");
        widget_wrapper.classList.remove("dmca-dock-top-right");
        widget_wrapper.classList.remove("dmca-dock-bottom-right");
    } else if (getCookie("dmca_dock_side") == "tr") {
        widget_wrapper.classList.add("dmca-dock-top-right");
        widget_wrapper.classList.remove("dmca-dock-bottom-left");
        widget_wrapper.classList.remove("dmca-dock-top-left");
        widget_wrapper.classList.remove("dmca-dock-bottom-right");
    } else {
        widget_wrapper.classList.add("dmca-dock-bottom-right");
        widget_wrapper.classList.remove("dmca-dock-bottom-left");
        widget_wrapper.classList.remove("dmca-dock-top-left");
        widget_wrapper.classList.remove("dmca-dock-top-right");
    }

    if (getCookie("dmca_dark_theme") == "true") {
        darkTheme();
    } else {
        lightTheme();
    }

    if (getCookie("dmca_right_click") == "true") {
        enableRightClick();
    } else {
        disableRightClick();
    }

    if (getCookie("dmca_border_radius") == "sm" || getCookie("dmca_border_radius") == "lg") {
        changeBorderRadius();
    } else {
        removeCurrentBorderRadius("sm", true);
        removeCurrentBorderRadius("lg", true);
        
        let wrapper = document.getElementById("dmca-widget-wrapper");
        wrapper.classList.remove("dmca-bottom-border-radius-sm");
        wrapper.classList.remove("dmca-bottom-border-radius-lg");
        wrapper.classList.remove("dmca-top-border-radius-sm");
        wrapper.classList.remove("dmca-top-border-radius-lg");
    }
}

// Get DMCA account id
function getAccountId(token, callBack) {

    fetch("https://api.dmca.com/getAccount", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Token": token,
        },
    })
        .then((response) => response.json())
        .then((data) => {
            // console.log(data);
            callBack(data[0].ID);
        })
        .catch((error) => {
            console.error("Error: ", error);
            callBack("");
        });

}

// Get protected item 
function getProtectedItem(id, url, callBack) {

    let requestUrl = "https://api.dmca.com/getProtectedItem?id=" + id;
    requestUrl += "&url=" + encodeURIComponent(url);

    fetch(requestUrl, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((response) => response.json())
        .then((data) => {
            // console.log(data);
            callBack(data);
        })
        .catch((error) => {
            // console.error("Error: ", error);
            callBack("");
        });

}

// Update asset details 
function updateAssetDetails(data) {
    let el = document.getElementById("dmca-btn-asset-form");
    document.getElementById("dmca-asset-title").value = data.title;
    document.getElementById("dmca-asset-description").value = data.description;
    if (data.thumbnailUrl == null) {
        document.getElementById("dmca-thumbnail").setAttribute("src", "https://ppro-adder.azurewebsites.net/PP2020/images/temp/page-placeholder.png");
    } else {
        let thumb = data.thumbnailUrl;
        thumb = thumb.replace(/:\s*/g, (i => m => !i++ ? m : "%3A")(0));
        thumb = thumb.replace(/\+/g, "%2B");
        document.getElementById("dmca-thumbnail").setAttribute("src", thumb);
    }
    el.setAttribute("data-type", data.type);
    el.setAttribute("data-status", data.status);
}

// Disable right click
function disableRightClick() {
    document.getElementsByTagName("body")[0].classList.add("dmca-no-right-click");
}

// Enable right click
function enableRightClick() {
    document.getElementsByTagName("body")[0].classList.remove("dmca-no-right-click");
}

// Update widget status
function updateWidgetStatus(status, thumbnailUrl, title, description) {
    let el_btn = document.getElementById("dmca-page-status");
    let el_lock = document.getElementById("dmca-lock");

    if (status == null) {
        el_btn.innerHTML = "UNPROTECTED";
        el_btn.style.backgroundColor = "#CE1312";
        hide(document.getElementById("dmca-btn-delete"));
        hide(document.getElementById("dmca-btn-update"));
        show(document.getElementById("dmca-btn-protect"));
        hide(el_lock);
    } else {
        if (status.toLowerCase() == "active" || status.toLowerCase() == "") {
            el_btn.style.backgroundColor = "#1F1F1F";
            el_lock.style.backgroundColor = "#1F1F1F";
            show(document.getElementById("dmca-btn-delete"));
            show(el_lock);
        } else if (status.toLowerCase() == "inactive" || status.toLowerCase() == "disputed" || status.toLowerCase() == "pending") {
            el_btn.style.backgroundColor = "#D9B214";
            show(document.getElementById("dmca-btn-delete"));
            hide(el_lock);
        } else if (status.toLowerCase() == "unauthorized") {
            el_btn.style.backgroundColor = "#CE1312";
            hide(document.getElementById("dmca-btn-delete"));
            hide(el_lock);
        } else if (status.toLowerCase() == "tagged") {
            el_btn.style.backgroundColor = "#1D0FFF";
            el_lock.style.backgroundColor = "#1D0FFF";
            show(document.getElementById("dmca-btn-delete"));
            show(el_lock);
        } else if (status.toLowerCase() == "un-tagged") {
            el_btn.style.backgroundColor = "#BFCCD4";
            show(document.getElementById("dmca-btn-delete"));
            hide(el_lock);
        } else if (status.toLowerCase() == "listed") {
            el_btn.style.backgroundColor = "#54AAF8";
            el_lock.style.backgroundColor = "#54AAF8";
            show(document.getElementById("dmca-btn-delete"));
            show(el_lock);
        } else if (status.toLowerCase() == "un-listed") {
            el_btn.style.backgroundColor = "#54AAF8";
            show(document.getElementById("dmca-btn-delete"));
            hide(el_lock);
        } else {
            show(document.getElementById("dmca-btn-delete"));
            el_btn.style.backgroundColor = "#D9B214";
        }

        if (status.toLowerCase() == "active" || status.toLowerCase() == "") {
            el_btn.innerHTML = "PROTECTED";
            
            if(thumbnailUrl != null || thumbnailUrl != "") {
                let thumb = thumbnailUrl;
                thumb = thumb.replace(/:\s*/g, (i => m => !i++ ? m : "%3A")(0));
                thumb = thumb.replace(/\+/g, "%2B");
                document.getElementById("dmca-page-thumbnail").setAttribute("src", thumb);
            }
            document.getElementById("dmca-page-title").innerHTML = title;
            document.getElementById("dmca-page-description").innerHTML = description;
            document.getElementById("dmca-page-details").style.display = "flex";
        } else {
            el_btn.innerHTML = status.toUpperCase();
            hide(document.getElementById("dmca-page-details"));
        }

        hide(document.getElementById("dmca-btn-protect"));
        show(document.getElementById("dmca-btn-update"));
    }
    
    if(getCookie("dmca_verified_" + window.location.hostname) == "true") {
        show(document.getElementById("dmca-verified"));
        el_lock.style.backgroundColor = "#D9B214";
        show(el_lock);
    }
}

// Remove widget position to update the position
function removeWidgetPostion() {
    let widget_wrapper = document.getElementById("dmca-widget-wrapper");
    if (getCookie("dmca_dock_side") == "bl") {
        widget_wrapper.classList.remove("dmca-dock-bottom-left");
    } else if (getCookie("dmca_dock_side") == "tl") {
        widget_wrapper.classList.remove("dmca-dock-top-left");
    } else if (getCookie("dmca_dock_side") == "tr") {
        widget_wrapper.classList.remove("dmca-dock-top-right");
    } else {
        widget_wrapper.classList.remove("dmca-dock-bottom-right");
    }
}

// Upload to azure blob 
function uploadBlob(file) {
    
    if (typeof file !== 'undefined') {
        loading();

        var blobUri = 'https://dmca.blob.core.windows.net/logos';
        var SAS = 'st=2019-03-02T00%3A22%3A29Z&se=2028-03-03T00%3A22%3A00Z&sp=rw&sv=2018-03-28&sr=c&sig=5uj40e0WkJN4jO9efLP3CKvstLnc2LG%2BqWfMC6U4Ou0%3D';
        var blobService = AzureStorage.Blob.createBlobServiceWithSas(blobUri, SAS);

        if (file.size > 3000000) {
            show(document.getElementById("dmca-file-error"));
        } else {
            var customBlockSize = file.size > 1024 * 1024 * 32 ? 1024 * 1024 * 4 : 1024 * 512;
            blobService.singleBlobPutThresholdInBytes = 3000000;

            var UUID = generateUUID();
            var speedSummary = blobService.createBlockBlobFromBrowserFile('internal', UUID + '-' + file.name, file, { blockSize: customBlockSize }, function (error, result, response) {
                if (error) {
                    console.log(error);
                } else {
                    window.newThumbnailUrl = blobUri + '/internal/' + result.name + '?' + SAS;
                    document.getElementById("dmca-thumbnail").setAttribute("src", window.newThumbnailUrl);
                    removeLoading();
                    // console.log('Result: ', result);
                }
            });
        }
    }
}

// Display success message after add protection to all pages 
function protectAllPagesDisplayMsg(count_pages, total_pages) {
    let succ_el = document.getElementById("dmca-msg-success");
    if (count_pages == total_pages) {
        succ_el.innerHTML = "All pages are protected!";
    } else {
        succ_el.innerHTML = count_pages + " of " + total_pages + " pages are protected!";
    }

    hide(document.getElementById("dmca-site-profile"));
    removeLoadingSimple();
    show(document.getElementById("dmca-wrapper-msg-success"));

    setTimeout(function () {
        fadeOut(document.getElementById("dmca-wrapper-msg-success"));

        setTimeout(function () {
            // Rescan the page
            document.getElementById("dmca-btn-rescan").click();
        }, 500)

    }, 2500);

}

// Set cookie 
function setCookie(cookie_name, cookie_value) {
    document.cookie = cookie_name + "=" + cookie_value + ";path=/";
}

// Get cookie
function getCookie(cookie_name) {
    var name = cookie_name + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

// Display loading 
function loading() {
    show(document.getElementById("dmca-widget-overlay"));
    document.getElementById("dmca-loader").classList.remove('dmca-loader-no');
    document.getElementById("dmca-loader").classList.add('dmca-loader');
}

// Remove loading 
function removeLoading() {
    document.getElementById("dmca-loader").classList.remove('dmca-loader');
    document.getElementById("dmca-loader").classList.add('dmca-loader-no');
    show(document.getElementById("dmca-icon-star"));
    document.getElementById("dmca-icon-star").classList.add("dmca-animate");
    
    setTimeout(function () {
        hide(document.getElementById("dmca-icon-star"));
        document.getElementById("dmca-icon-star").classList.remove("dmca-animate");
        hide(document.getElementById("dmca-widget-overlay"));
    }, 1400);
    
}

function removeLoadingSimple() {
    document.getElementById("dmca-loader").classList.remove('dmca-loader');
    document.getElementById("dmca-loader").classList.add('dmca-loader-no');
    hide(document.getElementById("dmca-widget-overlay"));    
}

// Fade in element
function fadeIn(el) {
    setTimeout(function () {
        show(el);
        el.classList.remove('dmca-show');
    }, 500);
    el.classList.add('dmca-show');
    el.classList.remove('dmca-hide');
}

// Fade out element
function fadeOut(el) {
    setTimeout(function () {
        hide(el);
        el.classList.remove('dmca-hide');
    }, 500);
    el.classList.add('dmca-hide');
    el.classList.remove('dmca-show');
}

// Show element
function show(el) {
    el.style.display = "block";
}

// Hide element
function hide(el) {
    el.style.display = "none";
}

// Generate UUID
function generateUUID() {
    var d = new Date().getTime();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
        d += performance.now();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

// Save widget settings here 
function updateWidgetSettings(acc_id, domain, dark_theme, dock_side, border_radius, right_click) {
    
    const sasToken = '?sv=2020-02-10&ss=bfqt&srt=so&sp=rwdlacuptfx&se=2024-06-15T15:56:41Z&st=2021-06-15T07:56:41Z&spr=https&sig=vEXVc0Q%2B6UD2smeejWolcMdBX53yCp5fwg0CbvP%2FT%2FI%3D';
    const tableUri = 'https://' + 'dmcaadder' + '.table.core.windows.net';

    let tableService = AzureStorage.Table.createTableServiceWithSas(tableUri, sasToken);

    let insertEntity = {
        PartitionKey: { '_': acc_id },
        RowKey: { '_': domain },
        dark_theme: { '_': dark_theme },
        dock_side: { '_': dock_side },
        border_radius: { '_': border_radius },
        right_click: { '_': right_click },
        last_updated: { '_': new Date() }
    };

    tableService.insertOrReplaceEntity('widgetSettings', insertEntity, function (error, result, response) {
        if (error) {
            // Insert table entity error
            console.log("ERROR: ", error);
        } else {
            // Insert table entity successfully
            if (response.isSuccessful) {
                // console.log(response);
            }
        }
    });

}

// Get widget settings here
function getWidgetSettings(hostname, callBack) {
    
    const sasToken = '?sv=2020-02-10&ss=bfqt&srt=so&sp=rwdlacuptfx&se=2024-06-15T15:56:41Z&st=2021-06-15T07:56:41Z&spr=https&sig=vEXVc0Q%2B6UD2smeejWolcMdBX53yCp5fwg0CbvP%2FT%2FI%3D';
    const tableUri = 'https://' + 'dmcaadder' + '.table.core.windows.net';

    let tableService = AzureStorage.Table.createTableServiceWithSas(tableUri, sasToken);

    let tableQuery = new AzureStorage.Table.TableQuery().top(1).where('RowKey eq ?', hostname);
    tableService.queryEntities('widgetSettings', tableQuery, null, function (error, result) {
        if (error) {
            // Query entities error
            console.log('ERROR: ', error);
            callBack(false);
        } else {

            if (result.entries.length == 1) {

                let entity = result.entries[0];

                if (entity.RowKey['_'] == hostname) {
                    setCookie("dmca_dock_side", (typeof entity.dock_side != "undefined" ? entity.dock_side['_'] : "br"));
                    setCookie("dmca_dark_theme", (typeof entity.dark_theme != "undefined" ? entity.dark_theme['_'] : "false"));
                    setCookie("dmca_border_radius", (typeof entity.border_radius != "undefined" ? entity.border_radius['_'] : "no"));
                    setCookie("dmca_right_click", (typeof entity.right_click != "undefined" ? entity.right_click['_'] : "true"));
                    callBack(true);
                }

            } else if (result.entries.length == 0) {
                // Defaults 
                setCookie("dmca_dock_side", "br");
                setCookie("dmca_dark_theme", "false");
                setCookie("dmca_border_radius", "no");
                setCookie("dmca_right_click", "true");
                callBack(true);
            }

        }
    });
}

// Get widget settings by using account id and hostname 
function getWidgetSettingsByAccountId(acc_id, hostname, callBack) {
    
    const sasToken = '?sv=2020-02-10&ss=bfqt&srt=so&sp=rwdlacuptfx&se=2024-06-15T15:56:41Z&st=2021-06-15T07:56:41Z&spr=https&sig=vEXVc0Q%2B6UD2smeejWolcMdBX53yCp5fwg0CbvP%2FT%2FI%3D';
    const tableUri = 'https://' + 'dmcaadder' + '.table.core.windows.net';

    let tableService = AzureStorage.Table.createTableServiceWithSas(tableUri, sasToken);

    let tableQuery = new AzureStorage.Table.TableQuery().top(1).where('RowKey eq ?', hostname).and('PartitionKey eq ?', acc_id);
    tableService.queryEntities('widgetSettings', tableQuery, null, function (error, result) {
        if (error) {
            // Query entities error
            console.log('ERROR: ', error);
            callBack(false);
        } else {
            
            if (result.entries.length == 1) {

                let entity = result.entries[0];

                if (entity.RowKey['_'] == hostname) {
                    setCookie("dmca_dock_side", (typeof entity.dock_side != "undefined" ? entity.dock_side['_'] : "br"));
                    setCookie("dmca_dark_theme", (typeof entity.dark_theme != "undefined" ? entity.dark_theme['_'] : "false"));
                    setCookie("dmca_border_radius", (typeof entity.border_radius != "undefined" ? entity.border_radius['_'] : "no"));
                    setCookie("dmca_right_click", (typeof entity.right_click != "undefined" ? entity.right_click['_'] : "true"));
                    callBack(true);
                }

            } else if (result.entries.length == 0) {
                // Defaults 
                setCookie("dmca_dock_side", "br");
                setCookie("dmca_dark_theme", "false");
                setCookie("dmca_border_radius", "no");
                setCookie("dmca_right_click", "true");
                callBack(true);
            }

        }
    });
}

// Add dark theme
function darkTheme() {

    let bg = document.getElementsByClassName("dmca-change-theme-bg");
    let i;
    for (i = 0; i < bg.length; i++) {
        bg[i].classList.remove("dmca-bg-white");
        bg[i].classList.add("dmca-bg-dark");
    }

    let txt = document.getElementsByClassName("dmca-change-theme-text");
    let j;
    for (j = 0; j < txt.length; j++) {
        txt[j].classList.remove("dmca-text-dark");
        txt[j].classList.add("dmca-text-white");
    }

    let btn = document.getElementsByClassName("dmca-change-theme");
    let k;
    for (k = 0; k < btn.length; k++) {
        btn[k].classList.remove("dmca-bg-white");
        btn[k].classList.remove("dmca-text-dark");
        btn[k].classList.add("dmca-text-white");
        btn[k].classList.add("dmca-bg-dark");
    }

    let btn_o = document.getElementsByClassName("dmca-change-theme-btn-o");
    let l;
    for (l = 0; l < btn_o.length; l++) {
        btn_o[l].classList.remove("dmca-btn-dark-outline");
        btn_o[l].classList.add("dmca-btn-white-outline");
    }

    let border = document.getElementsByClassName("dmca-change-theme-border");
    let m;
    for (m = 0; m < border.length; m++) {
        border[m].classList.remove("dmca-border-dark");
        border[m].classList.add("dmca-border-white");
    }

    let icon = document.getElementsByClassName("dmca-icon");
    let n;
    for (n = 0; n < icon.length; n++) {
        icon[n].classList.add("dmca-icon-white");
    }

}

// Add light theme
function lightTheme() {

    let bg = document.getElementsByClassName("dmca-change-theme-bg");
    let i;
    for (i = 0; i < bg.length; i++) {
        bg[i].classList.remove("dmca-bg-dark");
        bg[i].classList.add("dmca-bg-white");
    }

    let txt = document.getElementsByClassName("dmca-change-theme-text");
    let j;
    for (j = 0; j < txt.length; j++) {
        txt[j].classList.remove("dmca-text-white");
        txt[j].classList.add("dmca-text-dark");
    }

    let btn = document.getElementsByClassName("dmca-change-theme");
    let k;
    for (k = 0; k < btn.length; k++) {
        btn[k].classList.remove("dmca-bg-dark");
        btn[k].classList.remove("dmca-text-white");
        btn[k].classList.add("dmca-text-dark");
        btn[k].classList.add("dmca-bg-white");
    }

    let btn_o = document.getElementsByClassName("dmca-change-theme-btn-o");
    let l;
    for (l = 0; l < btn_o.length; l++) {
        btn_o[l].classList.remove("dmca-btn-white-outline");
        btn_o[l].classList.add("dmca-btn-dark-outline");
    }

    let border = document.getElementsByClassName("dmca-change-theme-border");
    let m;
    for (m = 0; m < border.length; m++) {
        border[m].classList.remove("dmca-border-white");
        border[m].classList.add("dmca-border-dark");
    }

    let icon = document.getElementsByClassName("dmca-icon");
    let n;
    for (n = 0; n < icon.length; n++) {
        icon[n].classList.remove("dmca-icon-white");
    }

}

// Change the border radius
function changeBorderRadius() {
    if (getCookie("dmca_border_radius") == "sm") {
        let ele = document.getElementsByClassName("change-border-radius");
        let n;
        for (n = 0; n < ele.length; n++) {
            ele[n].classList.add("dmca-border-radius-sm");
        }
        changeBorderRadiusBothSizes();
        changeWidgetWrapperBorderRadius(getCookie("dmca_dock_side"), "sm");
    } else if (getCookie("dmca_border_radius") == "lg") {
        let ele = document.getElementsByClassName("change-border-radius");
        let n;
        for (n = 0; n < ele.length; n++) {
            ele[n].classList.add("dmca-border-radius-lg");
        }
        changeBorderRadiusBothSizes();
        changeWidgetWrapperBorderRadius(getCookie("dmca_dock_side"), "lg");
    }
}

// Change the border radius for both sm and lg options 
function changeBorderRadiusBothSizes() {
    let sl_ele = document.getElementsByClassName("dmca-change-border-radius-sl");
    let m;
    for (m = 0; m < sl_ele.length; m++) {
        sl_ele[m].classList.add("dmca-border-radius-sm");
    }
}

// Chnage the border radius for widget wrapper 
function changeWidgetWrapperBorderRadius(side, size) {
    let wrapper = document.getElementById("dmca-widget-wrapper");
    
    wrapper.classList.remove("dmca-bottom-border-radius-lg");
    wrapper.classList.remove("dmca-bottom-border-radius-sm");
    wrapper.classList.remove("dmca-top-border-radius-lg");
    wrapper.classList.remove("dmca-top-border-radius-sm");

    if (side == "tr" || side == "tl") {
        if (size == "lg") {
            wrapper.classList.add("dmca-bottom-border-radius-lg");
        } else {
            wrapper.classList.add("dmca-bottom-border-radius-sm");
        }

    } else if (side == "br" || side == "bl") {
        if (size == "lg") {
            wrapper.classList.add("dmca-top-border-radius-lg");
        } else {
            wrapper.classList.add("dmca-top-border-radius-sm");
        }
    }
}

// Remove the exsisting border radius
function removeCurrentBorderRadius(size, no_radius) {
    if (no_radius) {
        let sl_ele = document.getElementsByClassName("dmca-change-border-radius-sl");
        let i;
        for (i = 0; i < sl_ele.length; i++) {
            sl_ele[i].classList.remove("dmca-border-radius-" + size);
        }
    }

    let ele = document.getElementsByClassName("change-border-radius");
    let n;
    for (n = 0; n < ele.length; n++) {
        ele[n].classList.remove("dmca-border-radius-" + size);
    }

    removeWidgetWrapperBorderRadius(getCookie("dmca_dock_side"), size);

}

// Remove the border radius for widget wrapper 
function removeWidgetWrapperBorderRadius(side, size) {
    let wrapper = document.getElementById("dmca-widget-wrapper");
    if (side == "tr" || side == "tl") {
        wrapper.classList.remove("dmca-bottom-border-radius-" + size);
    } else if (side == "br" || side == "bl") {
        wrapper.classList.remove("dmca-top-border-radius-" + size);
    }
}

// Get site object by domain 
function getSiteObjectByDomain(website, callBack) {
    fetch("https://api.dmca.com/getSiteByDomain?domain=" + website, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((response) => {
            
            if(response.status == 404) {
                console.log("ERROR: ", response.status)
                callBack(false);
            } else {
                response.json().then((data) => {
                
                    var json_str = JSON.stringify(data[0]);
                    setCookie("dmca_site_object", json_str);
        
                    if (data[0].IS_VALIDATED == 1) {
                        setCookie("dmca_validated_" + website, true);
                        if(data[0].PROTECTION_LEVEL == true) {
                            setCookie("dmca_verified_" + website, true);
                        }
                    }
                    
                    if(getCookie("dmca_account_id") != data[0].ACCOUNT_ID && data[0].ACCOUNT_ID != null) {
                        setCookie("dmca_account_id", data[0].ACCOUNT_ID);
                    }
                    
                    callBack(true);
                });
                
            }

        })
        .catch((error) => {
            console.error("ERROR: ", error);
            callBack(false);
        });
}

// Display site profile data 
function siteProfiledata() {

    let json_str = getCookie("dmca_site_object");
    let data = JSON.parse(json_str);

    let status = document.getElementById("dmca-profile-status");
    if (data.COMPLIANCE_AGREED == 1) {
        status.classList.remove("dmca-text-red");
        status.classList.add("dmca-text-green");
        status.innerHTML = "Confirmed";
    } else {
        status.classList.remove("dmca-text-green");
        status.classList.add("dmca-text-red");
        status.innerHTML = "Not set";
    }

    document.getElementById("dmca-profile-owned").innerHTML = data.SITE_OWNER;
    document.getElementById("dmca-profile-generated-on").innerHTML = data.DATE_ENTERED.split("T")[0];
    document.getElementById("dmca-profile-updated-on").innerHTML = data.DATE_MODIFIED.split("T")[0];
    document.getElementById("dmca-profile-id").innerHTML = data.ID;
    document.getElementById("dmca-profile-screenshot").setAttribute("src", "https://image.thum.io/get/width/1280/crop/720/maxAge/24/allowJPG/" + window.location.protocol + "//" + window.location.hostname);

    if (data.FB_URL != null) {
        document.getElementById("dmca-profile-fb").setAttribute("href", data.FB_URL);
    }

    if (data.TWITTER_URL != null) {
        document.getElementById("dmca-profile-twitter").setAttribute("href", data.TWITTER_URL);
    }

    hide(document.getElementById("dmca-form-update-asset"));
    if (document.getElementById("dmca-btn-protect").style.display == "none") {
        show(document.getElementById("dmca-btn-update"));
    }
    document.getElementById("dmca-btn-close-widget-claim").click();
    hide(document.getElementById("dmca-widget-settings"));
    show(document.getElementById("dmca-site-profile"));
    removeLoading();
}

// Delete protected item
function deleteProtectedItem(url, acc_id, callBack) {

    fetch("https://api.dmca.com/deleteProtectedItem?id=" + acc_id + "&url=" + url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Token": getCookie("dmca_token"),
        },
        body: JSON.stringify(null),
    })
        .then((response) => response.json())
        .then((data) => {
            callBack(true);
        })
        .catch((error) => {
            callBack(false);
        });
        
}

// Add widget.css
function addStyleSheet() {
    const link = document.createElement("link");
    link.type = "text/css";
    link.rel = "stylesheet";
    link.href = "https://ppro-adder.azurewebsites.net/PP2020/css/widget.css";
    document.getElementsByTagName("head")[0].appendChild(link);
}

// Add Azure table azure-storage.table.min.js 
function addAzureTableJs() {
    const azure_table = document.createElement("script");
    azure_table.src = "https://www.dmca.com/js/azurestoragejs-2.10.102/azure-storage.table.min.js";
    document.getElementsByTagName("body")[0].appendChild(azure_table);
}

// Add Azure blob azure-storage.blob.min.js 
function addAzureBlobJs() {
    const azure_blob = document.createElement("script");
    azure_blob.src = "https://www.dmca.com/js/azurestoragejs-2.10.102/azure-storage.blob.min.js";
    document.getElementsByTagName("body")[0].appendChild(azure_blob);
}

// Add internal styles
function addInternalStyles() {

    // css rules
    var styles = `
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@800&family=Open+Sans&display=swap');

        @media (max-width: 389.98px) {
        	#dmca-widget-wrapper {
        		width: 100%;
        		padding: 5px;
        	}
        	#dmca-logo, #dmca-page-status, #dmca-verified {
        		font-size: 14px !important;
        	}
        	#dmca-lock svg, #dmca-min-max-arrows svg {
        		padding: 4px;
        		width: 100%;
        		height: 100%;
        		-webkit-box-sizing: border-box;
        		-moz-box-sizing: border-box;
        		box-sizing: border-box;
        	}
        	#dmca-lock, #dmca-min-max-arrows {
        		width: 24px;
        		height: 24px;
        	}
        	#dmca-menu {
        		padding: 2px 4px;
        	}
        	.dmca-dock-bottom-right, .dmca-dock-bottom-left {
        		bottom: 0;
        		right: 0;
        	}
        	
        	.dmca-dock-top-right, .dmca-dock-top-left {
        		top: 0;
        		left: 0;
        	}
        	
        	#dmca-menu-content {
        		right: 5px;
        	}
        }
        
        @media (min-width: 390px) {
        	#dmca-widget-wrapper {
        		width: 390px;
        		padding: 10px;
        	}
        	#dmca-logo, #dmca-page-status, #dmca-verified {
        		font-size: 16px !important;
        	}
        	#dmca-lock svg, #dmca-min-max-arrows svg {
        		padding: 5px;
        		width: 100%;
        		height: 100%;
        		-webkit-box-sizing: border-box;
        		-moz-box-sizing: border-box;
        		box-sizing: border-box;
        	}
        	#dmca-lock, #dmca-min-max-arrows {
        		width: 26px;
        		height: 26px;
        	}
        	#dmca-menu {
        		padding: 3px 4px;
        	}
        	.dmca-dock-bottom-right {
        		bottom: 0;
        		right: 5px;
        	}
        	
        	.dmca-dock-bottom-left {
        		bottom: 0;
        		left: 5px;
        	}
        	
        	.dmca-dock-top-right {
        		top: 0;
        		right: 5px;
        	}
        	
        	.dmca-dock-top-left {
        		top: 0;
        		left: 5px;
        	}
        	
        	#dmca-menu-content {
        		right: 10px;
        	}
        }
        
        h4.dmca-title {
        	font-size: 18px;
        }
        
        h5.dmca-title {
        	font-size: 20px;
        }
        
        .dmca-border-radius-sm {
        	border-radius: 5px;
        }
        
        .dmca-border-radius-lg {
        	border-radius: 25px;
        }
        
        .dmca-top-border-radius-sm {
        	border-top-left-radius: 5px;
        	border-top-right-radius: 5px;
        }
        
        .dmca-top-border-radius-lg {
        	border-top-left-radius: 25px;
        	border-top-right-radius: 25px;
        }
        
        .dmca-bottom-border-radius-sm {
        	border-bottom-left-radius: 5px;
        	border-bottom-right-radius: 5px;
        }
        
        .dmca-bottom-border-radius-lg {
        	border-bottom-left-radius: 25px;
        	border-bottom-right-radius: 25px;
        }
        
        #dmca-widget-header-content {
        	display: flex;
        	flex-direction: row;
        	justify-content: space-between;
        	align-items: center;
        }
        
        .dmca-header-content1, .dmca-header-content2 {
        	display: flex;
        	flex-direction: row;
        	justify-content: space-between;
        	align-items: center;
        }
        
        .dmca-header-content1>div, .dmca-header-content2>div {
        	margin-right: 3px;
        }
        
        .dmca-header-content1>div:last-child, .dmca-header-content2>div:last-child {
        	margin-right: 0px;
        }
        
        #dmca-logo, #dmca-page-status, #dmca-lock, #dmca-menu, #dmca-verified, #dmca-min-max-arrows {
        	box-shadow: rgba(255, 255, 255, 0.56) 0px 0px 3px;
        }
        
        #dmca-logo, #dmca-page-status, #dmca-verified {
        	display: inline-block;
        	padding: 5px 5px;
        	font-weight: 800 !important;
        	letter-spacing: -0.1px;
        	line-height: 1;
        	font-family: 'Montserrat', sans-serif !important;
        }
        
        #dmca-verified {
        	background-color: #D9B214;
        }
        
        #dmca-logo {
        	white-space:nowrap;
        	overflow: hidden;
        }
        
        #dmca-page-status {
        	white-space:nowrap;
        	overflow: hidden;
        	
        }
        
        #dmca-lock, #dmca-min-max-arrows {
        	display: inline-block;
        }
        
        #dmca-min-max-arrows {
        	cursor: pointer;
        }
        
        #dmca-menu {
        	display: inline-block;
        	cursor: pointer;
        }
        
        #dmca-menu>div.dmca-bar {
        	width: 18px;
        	height: 3px;
        	margin: 3px 0;
        }
        
        #dmca-menu>div.dmca-bar:first-child {
        	margin: 2px 0 3px 0;
        }
        
        #dmca-menu:hover>div.dmca-bar {
        	background-color: #eeeeee;
        }
        
        #dmca-menu-content {
        	display: none;
        	position: absolute;
        	min-width: 120px;
        	box-shadow: 0px 2px 2px 3px rgba(204,204,204,0.4);
        	z-index: 1;
        	margin-top: 3px;
        }
        
        #dmca-menu-content a {
        	padding: 5px 10px;
        	text-decoration: none;
        	display: block;
        	font-size: 13px;
        	font-weight: 700;
        }
        
        #dmca-menu-content.dmca-border-radius-sm a:first-child {
        	border-top-left-radius: 5px;
        	border-top-right-radius: 5px;
        }
        
        #dmca-menu-content.dmca-border-radius-sm a:last-child {
        	border-bottom-left-radius: 5px;
        	border-bottom-right-radius: 5px;
        }
        
        #dmca-menu-content a:hover {
        	background-color: rgba(107, 197, 48, 0.8);
        }
        
        #dmca-menu:hover #dmca-menu-content {
        	display: block;
        }
        
        #dmca-widget-wrapper {
        	position: fixed;
        	z-index: 300;
        	font-size: 16px;
        	line-height: 1.25;
        	box-shadow: rgba(0, 0, 0, 0.16) 0px 5px 40px;
        }
        
        #dmca-widget-wrapper * {
        	font-family: 'Open Sans',sans-serif;
        	box-sizing: border-box;
        }
        
        input.dmca-input::placeholder, textarea.dmca-textarea::placeholder {
        	font-family: 'Open Sans',sans-serif;
        	color: #CBCBCB;
        }
        
        #dmca-widget-header {
        	margin-bottom: 10px;
        }
        
        #dmca-widget-header img {
        	height: 30px;
        	width: auto;
        }
        
        #dmca-widget-content {
        	min-height: 165px;
        	flex-direction: column;
        	justify-content: center;
        }
        
        #dmca-widget-wrapper, #dmca-error-login, #dmca-widget-content, #dmca-wrapper-msg-success, #dmca-site-profile, #dmca-widget-settings, #dmca-claim-domain, #dmca-menu, #dmca-btn-dark-theme-on, #dmca-btn-dark-theme-off, #dmca-btn-auto-submit, #dmca-btn-auto-submit-on, #dmca-btn-auto-submit-off, #dmca-file-error, #dmca-page-details, #dmca-thumbnail-input, #dmca-wrapper-msg-error, #dmca-form-login, #dmca-wrapper-asset, #dmca-btn-update, #dmca-btn-protect, .dmca-arrow.dmca-down, #dmca-btn-delete, #dmca-form-update-asset, #dmca-verified, #dmca-lock, #dmca-btn-right-click-on, #dmca-btn-right-click-off {
        	display: none;
        }
        
        .dmca-text-green {
        	color: #6BC530;
        }
        
        .dmca-text-red {
        	color: #CE1312;
        }
        
        .dmca-text-gray {
        	color: #999999;
        }
        
        .dmca-text-dark {
        	color: #1F1F1F;
        }
        
        .dmca-text-white {
        	color: #fff;
        }
        
        .dmca-bg-dark {
        	background-color: #1F1F1F;
        }
        
        .dmca-bg-white {
        	background-color: #FFFFFF;
        }
        
        .dmca-bg-green {
        	background-color: #6BC530;
        }
        
        .dmca-bg-gray {
        	background-color: #999999;
        }
        
        .dmca-border-dark {
        	box-shadow: rgb(0 0 0 / 15%) 0px 4px 15px 0px, rgb(0 0 0 / 15%) 0px 1px 2px 0px, rgb(100 188 43 / 60%) 0px 2px 0px 0px inset;
        }
        
        .dmca-border-white {
        	box-shadow: rgb(255 255 255 / 10%) 0px 4px 15px 0px, rgb(255 255 255 / 10%) 0px 1px 2px 0px, rgb(100 188 43 / 60%) 0px 2px 0px 0px inset;
        }
        
        #dmca-file-error {
        	color: #CE1312;
        	font-size: 13px;
        }
        
        .dmca-text-center {
        	text-align: center;
        }
        
        .dmca-text-bold {
        	font-weight: 700;
        }

        .dmca-text-shadow {
        	text-shadow: 1px 1px 2px #000;
        }
        
        .dmca-show {
        	opacity: 1;
        	transition: opacity 500ms;
        }
        
        .dmca-hide {
        	opacity: 0;
        	transition: opacity 500ms;
        }
        
        input.dmca-input, textarea.dmca-textarea {
        	width: 100%;
        	font-size: 16px;
        	margin-bottom: 5px;
        	box-shadow: rgb(0 0 0 / 7%) 0px 1px 3px 0px inset;
        	border: 1px solid rgba(225, 225, 225, 0.6);
        	outline: 0;
        	-webkit-box-sizing: border-box;
        	-moz-box-sizing: border-box;
        	box-sizing: border-box;
        }
        
        #dmca-form-login {
        	padding: 10px;
        }
        
        #dmca-form-login input {
        	padding: 5px 35px;
        }
        
        #dmca-form-update-asset input, #dmca-form-update-asset textarea {
        	padding: 5px 10px;
        }
        
        #dmca-form-update-asset, #dmca-site-profile, #dmca-widget-settings, #dmca-claim-domain {
        	padding: 16px;
        	margin: 10px 0;
        }
        
        #dmca-form-update-asset lable {
        	color: #999999;
        }
        
        .dmca-input-wrapper {
        	position: relative;
        }
        
        .dmca-icon_email, .dmca-icon_pwd {
        	position: absolute;
        	top: 42%;
        	left: 5px;
        	-webkit-transform: translateY(-50%);
        	-ms-transform: translateY(-50%);
        	transform: translateY(-50%);
        }
        
        #dmca-form-login lable {
        	font-size: 13px;
        	margin-bottom: 3px;
        }
        
        #dmca-form-login h4 {
        	margin-bottom: 10px;
        }
        
        #dmca-site-profile p {
        	margin-top: 5px;
        }
        
        #dmca-site-profile a {
        	text-decoration: none;
        }
        
        #dmca-site-profile p.dmca-border-bottom {
        	border-bottom: 1px solid #eee;
        }
        
        #dmca-site-profile p i {
        	font-size: 14px;
        }
        
        #dmca-site-profile p span {
        	font-size: 14px;
        }
        
        .dmca-btn {
        	padding: 5px 15px;
        	border: none;
        	font-weight: bold;
        	display: block;
        	width: 100%;
        	font-size: 16px;
        	margin-top: 5px;
        }
        
        .dmca-btn:hover {
        	cursor: pointer;
        }
        
        .dmca-btn:focus {
        	outline: none;
        }
        
        .dmca-btn-green {
        	background-color: #6BC530;
        	border: 2px solid #6BC530;
        	color: #fff;
        	box-shadow: rgba(255, 255, 255, 0.56) 0px 0px 5px;
        }
        
        .dmca-btn-green:hover {
        	background-color: #fff;
        	color: #6BC530;
        }
        
        .dmca-btn-red {
        	background-color: #CE1312;
        	color: #fff;
        	border: 2px solid #fff;
        }
        
        .dmca-btn-red:hover {
        	background-color: #fff;
        	color: #CE1312;
        }
        
        .dmca-btn-green-outline:hover {
        	background-color: #6BC530;
        	color: #fff;
        }
        
        .dmca-btn-green-outline {
        	background-color: #fff;
        	border: 2px solid #6BC530;
        	color: #6BC530;
        }
        
        .dmca-btn-dark {
        	background-color: #1F1F1F;
        	border: 2px solid #1F1F1F;
        	color: #fff;
        }
        
        .dmca-btn-dark:hover {
        	background-color: #fff;
        	color: #1F1F1F;
        }
        
        .dmca-btn-dark-outline:hover {
        	background-color: #1F1F1F;
        	color: #fff;
        }
        
        .dmca-btn-dark-outline {
        	background-color: #fff;
        	box-shadow: rgba(0, 0, 0, 0.56) 0px 0px 5px;
        	color: #1F1F1F;
        }
        
        .dmca-btn-white {
        	background-color: #fff;
        	border: 2px solid #fff;
        	color: #1F1F1F;
        }
        
        .dmca-btn-white:hover {
        	background-color: #1F1F1F;
        	color: #fff;
        }
        
        .dmca-btn-white-outline:hover {
        	background-color: #fff;
        	color: #1F1F1F;
        }
        
        .dmca-btn-white-outline {
        	background-color: #1F1F1F;
        	box-shadow: rgba(255, 255, 255, 0.56) 0px 0px 5px;
        	color: #fff;
        }
        
        #dmca-btn-update, #dmca-btn-protect {
        	margin: 10px 0px;
        }
        
        #dmca-wrapper-msg-success, #dmca-wrapper-msg-error {
        	margin-top: 10px;
        	padding: 10px;
        }
        
        #dmca-thumbnail, #dmca-profile-screenshot {
        	width: 100%;
        	height: auto;
        	box-shadow: rgb(0 0 0 / 7%) 0px 1px 3px 0px inset;
            border: 1px solid rgba(225, 225, 225, 0.6);
        }
        
        svg#dmca-upload {
        	width: 20px;
        	height: 20px;
        	padding: 10px;
        	border-radius: 20px;
        	position: absolute;
        	bottom: 10px;
        	left: 10px;
        	background-color: rgba(255, 255, 255, 0.6);
        	cursor: pointer;
        	border: 1px solid #1F1F1F;
        }
        
        svg#dmca-upload:hover {
        	background-color: rgba(255, 255, 255, 0.8);
        }
        
        .dmca-icon-white path, .dmca-arrow path {
            fill: #ffffff;
        }
        
        .dmca-auto-submit {
        	margin-top: 10px;
        }
        
        .dmca-widget-theme, .dmca-widget-dock, .dmca-widget-border-radius {
        	margin-top: 5px;
        }
        
        .dmca-auto-submit {
        	flex-direction: columns;
        	justify-content: center;
        	align-items: center;
        	font-weight: 700;	
        }
        
        .dmca-widget-theme, .dmca-widget-dock, .dmca-widget-border-radius {
        	display: flex;
        	flex-direction: columns;
        	justify-content: center;
        	align-items: center;
        	font-weight: 700;	
        }
        
        .dmca-auto-submit span, .dmca-widget-theme span {
        	margin-right: 5px;
        	cursor: pointer;
        }
        
        .dmca-widget-dock span, .dmca-widget-border-radius span {
        	border: 2px solid #cccccc;
        	margin-right: 10px;
        	cursor: pointer;
        }
        
        .dmca-widget-dock span {
        	width: 30px;
        	height: 30px;
        }
        
        .dmca-widget-border-radius span {
        	width: 45px;
        	height: 30px;
        }
        
        .dmca-widget-dock span:hover, .dmca-widget-border-radius span:hover {
        	background-color: #eeeeee;
        }
        
        .dmca-dot {
          height: 10px;
          width: 10px;
          border-radius: 50%;
          display: inline-block;
          position: relative;
        }
        
        #dmca-btn-dock-tl .dmca-dot {
          top: 1px;
          right: 9px;
        }
        
        #dmca-btn-dock-tr .dmca-dot {
          top: 1px;
          left: 9px;
        }
        
        #dmca-btn-dock-bl .dmca-dot {
          bottom: -19px;
          right: 9px;
        }
        
        #dmca-btn-dock-br .dmca-dot {
          bottom: -19px;
          left: 9px;
        }
        
        .dmca-widget-dock span.dmca-active, .dmca-widget-border-radius span.dmca-active {
        	border: 2px solid #6BC530;
        }
        
        .dmca-auto-submit span:last-child, .dmca-widget-theme span:last-child {
        	cursor: auto;
        }
        
        #dmca-widget-settings h5 {
        	margin-top: 15px;
        	font-size: 14px;
        }
        
        #dmca-widget-settings button, #dmca-claim-domain button {
        	margin-top: 10px;
        }
        
        #dark-theme-msg {
        	font-size: 14px;
        }
        
        #dmca-tooltiptext {
        	visibility: hidden;
        	width: 80%;
        	background-color: rgba(0, 0, 0, 0.6);
        	color: #fff;
        	text-align: center;
        	padding: 10px;
        	position: absolute;
        	z-index: 1;
        	bottom: 105%;
        	left: 20%;
        	margin-left: -60px;
        }
        
        #dmca-tooltiptext::after {
        	content: "";
        	position: absolute;
        	top: 100%;
        	left: 20%;
        	margin-left: -5px;
        	border-width: 5px;
        	border-style: solid;
        	border-color: rgba(0, 0, 0, 0.6) transparent transparent transparent;
        }
        
        .dmca-tooltip:hover #dmca-tooltiptext {
        	visibility: visible;
        }
        
        #dmca-page-details {
        	padding: 10px;
            flex-direction: row;
            justify-content: space-between;
        	margin-bottom: 10px;
        }
        
        #dmca-page-details div {
        	width: 100%;
        }
        
        #dmca-page-thumbnail {
        	width: 75px;
        	height: auto;
        	max-height: 75px;
        	overflow-y: hidden;
        	margin-right: 5px;
        }
        
        #dmca-page-title {
        	font-size: 13px;
        }
        
        #dmca-page-description {
        	font-size: 12px;
        	text-align: justify;
        }
        
        .dmca-loader-no {
        	display: none;
        }
        
        .dmca-loader {
        	position: absolute;
        	top: 50%;
        	left: calc(50% - 35px);
            display: flex;
            justify-content: center;
            align-items: center;
        	z-index: 100000;
        }
        
        .dmca-loader>span {
            display: inline-block;
            width: 0;
            height: 0;
            border-radius: 50%;
            margin: 0 6px;
            transform: translate3d(0);
            animation: bounce 0.6s infinite alternate;
        }
        
        .dmca-loader>span:nth-child(2) {
            animation-delay: 0.2s;
        }
        
        .dmca-loader>span:nth-child(3) {
            animation-delay: 0.4s;
        }
        
        @keyframes bounce {
            to {
                width: 12px;
                height: 12px;
                transform: translate3d(0, -8px, 0);
            }
        }
        
        #dmca-icon-star {
        	position: absolute;
        	top: 45%;
        	left: calc(50% - 10px);
        	fill: #6BC530;
            width: 20px;
            height: 20px;
        	z-index: 1000;
        	display: none;
        }
        
        .dmca-animate {
        	animation: dmca-bounce 1.3s;
            transform: scale(1);
        }
        
        @keyframes dmca-bounce {
        	0% {
        	    transform: scale(1);
        	    opacity: 1;
        	    fill: #6BC530;
        	}
        
        	25% {
        	    transform: scale(2);
        	    opacity: 0.8;
        	    fill: #6BC530;
        	}
        
        	50% {
        	    transform: scale(.8);
        	    opacity: 1;
        	    fill: #c3cfe2;
        	    -ms-transform: rotate(-180deg);
        	    transform: rotate(-180deg);
        	}
        
        	75% {
        	    transform: scale(1.5);
        	    opacity: 0.8;
        	    fill: #6BC530;
        	}
        
        	100% {
        	    transform: scale(1);
        	    fill: #6BC530;
        	}
        }
        
        #dmca-widget-overlay {
            position: absolute;
            top: 0;
            left: 0;
            background-color: rgba(0, 0, 0, 0.5);
            width: 100%;
            height: 100%;
            display: none;
            z-index: 350;
        }
    `;
              
    /* Create style element */
    var style_el = document.createElement('style');
    style_el.type = 'text/css';

    if (style_el.styleSheet) {
        style_el.styleSheet.cssText = styles;
    } else {
        style_el.appendChild(document.createTextNode(styles));
    } 
      
    /* Append style to the head element */
    document.getElementsByTagName("head")[0].appendChild(style_el);
}
