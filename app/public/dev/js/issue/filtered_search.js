var FilteredSearch = (function () {
    var _searches =  [
        {
            key: "优先级",
            name: "priority",
            api: "/config/priority",
            symbol: ""
        },
        {
            key: "状态",
            name: "status",
            api: "/config/status",
            symbol: ""
        },
        {
            key: "迭代",
            name: "sprint",
            api: "/config/sprint?project_id=" + _cur_project_id,
            symbol: ""
        },
        {
            key: "类型",
            name: "issue_type",
            api: "/config/issueType?project_id=" + _cur_project_id,
            symbol: ""
        },
        {
            key: "模块",
            name: "module",
            api: "/config/module?project_id=" + _cur_project_id,
            symbol: ""
        },
        {
            key: "解决结果",
            name: "resolve",
            api: "/config/resolve",
            symbol: ""
        },
        {
            key: "报告人",
            name: "author",
            json: "users",
            symbol: "@"
        },
        {
            key: "经办人",
            name: "assignee",
            json: "users",
            symbol: "@"
        }];

    var mapping = {
        '优先级': "#js-dropdown-priority",
        '状态': "#js-dropdown-status",
        '迭代': "#js-dropdown-sprint",
        '类型': "#js-dropdown-issue_type",
        '模块': "#js-dropdown-module",
        '解决结果': "#js-dropdown-resolve",
        '报告人': "#js-dropdown-author",
        '经办人': "#js-dropdown-assignee",
        hint: "#js-dropdown-hint"
    }

    var _currentSearchesArr = [];
    var _currentSearchesParams = [];
    var _currentSearchesStr = "";
    var _urlParams = {};
    var _dropdownHtml = {};
    var _cur_project_id = "";
    var _issueConfig = {};
    var _searchesObject = {};

    function FilteredSearch(urlParams, issueConfig, project_id) {
        _cur_project_id = project_id;
        _issueConfig = issueConfig;
        IssueMain.prototype.getCurrentSearches();
        IssueMain.prototype.setRecentStorage();
        IssueMain.prototype.setCurrentSearch(_currentSearchesArr);
        IssueMain.prototype.setRecentSearch();
        IssueMain.prototype.getHintData();
        // IssueMain.prototype.getDropdownData("解决结果");
        _urlParams = urlParams;

        _searches.forEach(function (item) {
            var str = "#js-dropdown-" + item.name + " .filter-dropdown";
            _dropdownHtml[item.key] = $.trim($(str).html());
            _searchesObject[item.key] = str;
        });

        _dropdownHtml.hint = $.trim($("#js-dropdown-hint .filter-dropdown").html());
        _searchesObject.hint = "#js-dropdown-hint .filter-dropdown";

        $(".tokens-container").on("click.close", ".selectable-close", function () {
            $(this).parents(".js-visual-token").remove();
        });

        $(".tokens-container").on("click.clear", ".clear-search", function () {
            $(".tokens-container .filtered-search-token").remove();
        });

        $(".filtered-search-history-dropdown").on("click", ".filtered-search-history-dropdown-item", function (e) {
            var $item = $(this).find(".filtered-search-history-dropdown-token");
            var temp = [];

            $item.each(function (e) {
                var $this = $(this);
                var name = $this.find(".name").text();
                var value = $this.find(".value").text();
                temp.push({
                    name,
                    value
                });
            });

            // IssueMain.prototype.setCurrentSearch(temp);
        });

        $(".filtered-search-history-dropdown").on("click", ".filtered-search-history-clear-button", function (e) {
            sessionStorage.setItem("issue-recent-searches", "");
        });

        $("#filter-form").submit(function () {
            IssueMain.prototype.search(_urlParams);
            return false;
        });

        $("#filtered-search-issues").on("focus", function (e) {
            // console.log("dd");
        });
    };

    IssueMain.prototype.getSearchObjectValue = function (data) {
        var temp = null;
        _searches.forEach(function (n) {
            var name = decodeURIComponent(data[0]);
            if (n.key == name) {
                temp = n.symbol + decodeURIComponent(data[1]);
            }
        });

        return temp;
    };

    IssueMain.prototype.getCurrentSearches = function () {
        var searchKeys = window.location.search.slice(1).split("&");
        var searchKeysArr = [];
        var searchParams = [];
        var tempData = "";
        searchKeys.forEach(function (n) {
            var tempArr = n.split("=");
            var name = decodeURIComponent(tempArr[0]);
            var value = IssueMain.prototype.getSearchObjectValue(tempArr);
            var temp = {
                name,
                value
            };

            var temp1 = {
                name,
                value: decodeURIComponent(tempArr[1])
            };

            if (value) {
                searchKeysArr.push(temp);
                searchParams.push(temp1);
                tempData += name + ":" + value + " ";
            }
        });
        _currentSearchesArr = searchKeysArr;
        _currentSearchesParams = searchParams;
        _currentSearchesStr = $.trim(tempData);
    };

    IssueMain.prototype.getRecentStorage = function () {
        var tempSearches = [];
        var recentSearches = sessionStorage.getItem("issue-recent-searches");
        if (recentSearches) {
            tempSearches = JSON.parse(recentSearches);
        }

        return tempSearches;
    };

    IssueMain.prototype.setRecentStorage = function () {
        var tempSearches = IssueMain.prototype.getRecentStorage();

        var index = null;
        tempSearches.forEach(function (n, i) {
            if (n === _currentSearchesStr) {
                index = i;
            }
        });
        if (index === null) {
            tempSearches.push(_currentSearchesStr);
        } else if (index > 0) {
            var tempArr = tempSearches[index];
            tempSearches.splice(index, 1);
            tempSearches.unshift(tempArr);
        }

        var data = JSON.stringify(tempSearches);
        sessionStorage.setItem("issue-recent-searches", data);
    };

    IssueMain.prototype.setCurrentSearch = function (data) {
        var html = "";
        data.forEach(function (n) {
            html += '<li class="js-visual-token filtered-search-token">';
            html += '<div class="name">' + n.name + '</div>';
            html += '<div class="value">' + n.value + '</div>';
            html += '<div class="selectable-close"><i class="fa fa-times"></i></div></li>';
        });

        // $(".tokens-container .input-token").before(html);
    };

    IssueMain.prototype.setRecentSearch = function () {
        var tempSearches = IssueMain.prototype.getRecentStorage();
        var html = "";
        tempSearches.forEach(function (n) {
            html += '<li class="filtered-search-history-dropdown-item">';
            var tempArr = n.split(" ");
            tempArr.forEach(function (val) {
                var valArr = val.split(":");
                html += '<span class="filtered-search-history-dropdown-token">';
                html += '<span class="name">' + valArr[0] + '</span>';
                html += '<span class="value">' + valArr[1] + '</span>';
                html += '</span>';
            });
            html += '</li>';
        });
    };

    IssueMain.prototype.search = function (urlParams) {
        var $searches = $(".tokens-container .filtered-search-token");
        var searches = urlParams;
        $searches.each(function (e) {
            var name = $(this).find(".name").text();
            var value = $(this).find(".value").text();

            _searches.forEach(function (n) {
                if (n.key === name) {
                    value = value.replace(n.symbol, "");
                }
            });
            searches[encodeURIComponent(name)] = value;
        });
    };

    IssueMain.prototype.getSearchLeft = function () {
        var left1 = $(".filtered-search-box-input-container").offset().left;
        var left2 = $('.tokens-container .input-token').offset().left;

        var left = left2 - left1;
    };

    IssueMain.prototype.getHintData = function () {
        var hintArr = [];
        var $search = $(".tokens-container .filtered-search-token");
        $(".filtered-search-input-dropdown-menu:not(.hint-dropdown)").each(function (e) {
            var $this = $(this);
            var isSearched = false;

            $search.each(function (e) {
               var name = $(this).find(".name").text();
               if(name === $this.data("hint")) {
                   isSearched = true;
               }
            });

            if (!isSearched) {
                hintArr.push({
                    icon: $this.data("icon"),
                    name: $this.data("hint"),
                    tag: $this.data("tag")
                });
            }
        });

        var html = "";
        hintArr.forEach(function (n) {
            var tempData = _dropdownHtml.hint;
            var tempHtml = "";
            tempHtml = tempHtml.replace("{{icon}}", n.icon || "");
            tempHtml = tempHtml.replace("{{hint}}", n.hint || "");
            tempHtml = tempHtml.replace("{{tag}}", "<" + n.hint + ">" || "");
        });
    };

    IssueMain.prototype.getDropdownData = function (name) {
        var html = "";
        var apiUrl = "";
        var json = "";

        _searches.forEach(function (n) {
           if (n.key === name) {
               apiUrl = n.api || "";
               json = n.json ? _issueConfig[n.key] : ""
           }
        });

        if (apiUrl) {
            $.ajax({
                type: 'get',
                dataType: "json",
                async: true,
                url: apiUrl,
                success: function (resp) {
                    IssueMain.prototype.setDropdownData(resp, name);
                },
                error: function (res) {
                    notify_error("请求数据错误" + res);
                }
            });
        } else if (json){
            var tempData = [];
            for (var [key, value] of Object.entries(json)) {
                tempData.push(value);
            }

            IssueMain.prototype.setDropdownData(tempData, name);
        }
    };

    IssueMain.prototype.setDropdownData = function (data, name) {
        var html = ""
        data.forEach(function (n) {
            var tempData = _dropdownHtml[name];
            var tempHtml = "";
            tempHtml = tempData.replace("{{name}}", n.name || n.display_name || "");
            tempHtml = tempHtml.replace("{{avatar_url}}", n.avatar || "");
            tempHtml = tempHtml.replace("{{username}}", n.username || "");
            tempHtml = tempHtml.replace("{{color}}", n.color || "");
            html += tempHtml;
        });

        $(_searchesObject[name]).html(html);
    };

    return FilteredSearch;
})();