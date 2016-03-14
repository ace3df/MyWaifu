// Veriables
var list_file = "https://rawgit.com/ace3df/AcePictureBot/master/lists/Waifu%20List.txt";
var gender = "waifu";
var list = "Waifu";
var genderOption = false;
var includeShow = true;
var cleanedArray = [];
var cleanedArrayTwo = [];

String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) {
      return typeof args[number] != 'undefined' ? args[number] : match;
    });
};

String.prototype.replaceAll = function(search, replace) {
  if (replace === undefined) {
    return this.toString();
  }
  return this.replace(new RegExp('[' + search + ']', 'g'), replace);
};

function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue, randomIndex;
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

function praseArrayWith(index, show) {
  newArray = []
  for (var i = 0, len = cleanedArray.length; i < len; i++) {
    if (!cleanedArray[i][0]) {
      continue;
    }
    if (cleanedArray[i][0] === "#") {
      continue;
    }
    entry = cleanedArray[i].split("||");
    if (entry[index].replaceAll(" ", "-") == show){
      newArray.push(cleanedArray[i]);
    }
  }
  cleanedArray = newArray;
}

function readTextFile(file, second) {
  var second = typeof second !== 'undefined' ? second : false;
  return $.ajax({
    url: file,
    beforeSend: function() {
      $('#btnSubmit').attr('disabled', 'disabled');
    },
    success: function(data) {
      var allText = data.split("\n");
      for (var i = 0, len = allText.length; i < len; i++) {
        if (!allText[i][0]) {
          continue;
        }
        if (allText[i][0] === "#") {
          continue;
        }
        if (second) {
          cleanedArrayTwo.push(allText[i]);
        } else {
          cleanedArray.push(allText[i]);
        }
      }
      $('#btnSubmit').removeAttr('disabled');
    }
  });
}
// Load waifu list on site load.
readTextFile(list_file);

function getDataUri(url, callback) {
    // https://davidwalsh.name/convert-image-data-uri-javascript
    var image = new Image();
    image.onload = function () {
        var canvas = document.createElement('canvas');
        canvas.width = this.naturalWidth; // or 'width' if you want a special/scaled size
        canvas.height = this.naturalHeight; // or 'height' if you want a special/scaled size
        canvas.getContext('2d').drawImage(this, 0, 0);
        callback(canvas.toDataURL('image/jpg'));
    };
    image.src = url;
}

function resetHTML() {
  $("#img, #artby, #result, #fromshow, #share, #reportImage").fadeOut().promise().done(function() {
    if (!(genderOption)) {
      $("#optionalSettings").fadeOut(function() {
        $("#optionalSettings").hide();
      });
    }
  });
  restoreHTML();
}

function restoreHTML() {
  $("#img").html($("")).fadeIn();
  $("#artby").fadeIn();
  $("#result").fadeIn();
  if (includeShow) {
    $("#fromshow").fadeIn();
  }
  $("#share").fadeIn();
  $("#reportImage").fadeIn();
}

function getDropDownList(name, id, optionList) {
    // http://stackoverflow.com/a/7895287
    $("#optionalSettings").empty();
    $("#optionalSettings").fadeIn();
    $("#optionalSettings").text(name + ": ");
    var htmlStyle = "padding: 0 2 3 4;"
    var combo = $("<select></select>").attr("id", id).attr("name", name).attr("class", "form-control").attr("style", htmlStyle);
    $.each(optionList, function(i, el) {
      combo.append("<option value=" + el.replaceAll(" ", "-") + ">" + el + "</option>");
    });
    $("#optionalSettings").append(combo);
}

function slugify(text) {
  // https://gist.github.com/mathewbyrne/1280286
  // changed "-" to "_"
  return text.toString().toLowerCase()
    .replace(/\s+/g, '_')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '_')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

function loadImage(name, list, backup) {
    name = slugify(name).toLowerCase();
    loc = "img/" + gender.toLowerCase() + "/" + name + "/1.jpg";
    $.ajax({
      url: Flask.url_for('static', {"filename": loc}),
      type: 'HEAD',
      error: function() {
        if (backup) {
          loc = backup;
          $("#img").html($("<img>").attr("src", loc).attr("style", "max-width: 100%; max-height: 100%; border-radius: 3%;"));
        }
      },
      success: function() {
        getDataUri(Flask.url_for('static', {"filename": loc}), function(dataUri) {
            $("#img").html($("<img>").attr("src", dataUri).attr("style", "max-width: 100%; max-height: 100%; border-radius: 3%;"));
        });
      }
    });
}

$('#pos_lists').on('change', function() {
    // Changed selected list
    // Clear arrays
    cleanedArray = [];
    cleanedArrayTwo = [];
    if (this.value === "Waifu") {
      gender = "waifu";
      list = "Waifu";
      genderOption = false;
      readTextFile("https://rawgit.com/ace3df/AcePictureBot/master/lists/Waifu%20List.txt");
    } else if (this.value === "Husbando") {
      gender = "husbando";
      list = "Husbando";
      genderOption = false;
      readTextFile("https://rawgit.com/ace3df/AcePictureBot/master/lists/Husbando%20List.txt");
    } else if (this.value === "OTP") {
      getDropDownList("Gender", "gender", ["Both", "Yuri", "Yaoi"]);
      includeShow = true;
      gender = "otp";
      list = "OTP";
      genderOption = true;
      readTextFile("https://rawgit.com/ace3df/AcePictureBot/master/lists/Waifu%20List.txt");
      readTextFile("https://rawgit.com/ace3df/AcePictureBot/master/lists/Husbando%20List.txt", true);
    } else if (this.value === "Sensei") {
      // If this is selected make another drop down show with: All, Female, Male
      // make a True on readTextFile to append to list
      getDropDownList("Gender", "gender", ["Both", "Female", "Male"]);
      includeShow = true;
      list = "Sensei";
      genderOption = true;
      readTextFile("https://rawgit.com/ace3df/AcePictureBot/master/lists/Sensei%20Female.txt");
      readTextFile("https://rawgit.com/ace3df/AcePictureBot/master/lists/Sensei%20Male.txt", true);
    } else if (this.value === "Senpai") {
      // If this is selected make another drop down show with: All, Female, Male
      // make a True on readTextFile to append to list
      getDropDownList("Gender", "gender", ["Both", "Female", "Male"]);
      includeShow = true;
      list = "Senpai";
      genderOption = true;
      readTextFile("https://rawgit.com/ace3df/AcePictureBot/master/lists/Senpai%20Female.txt");
      readTextFile("https://rawgit.com/ace3df/AcePictureBot/master/lists/Senpai%20Male.txt", true);
    } else if (this.value === "Kouhai") {
      // If this is selected make another drop down show with: All, Female, Male
      // make a True on readTextFile to append to list
      getDropDownList("Gender", "gender", ["Both", "Female", "Male"]);
      includeShow = true;
      list = "Kouhai";
      genderOption = true;
      readTextFile("https://rawgit.com/ace3df/AcePictureBot/master/lists/Kouhai%20Female.txt");
      readTextFile("https://rawgit.com/ace3df/AcePictureBot/master/lists/Kouhai%20Male.txt", true);
    } else if (this.value === "Idol") {
      getDropDownList("Show", "gender", ["All Idol Shows", "Love Live!", "Idolmaster", "Idolmaster Cinderella Girls", "AKB0048", "Aikatsu!"]);
      includeShow = true;
      list = "Idol";
      genderOption = true;
      readTextFile("https://rawgit.com/ace3df/AcePictureBot/master/lists/Idol.txt");
    } else if (this.value === "Shipgirl") {
      getDropDownList("Show", "gender", ["Kancolle", "Aoki Hagane no Arpeggio", "Both"]);
      includeShow = false;
      list = "Shipgirl";
      genderOption = true;
      readTextFile("https://rawgit.com/ace3df/AcePictureBot/master/lists/Shipgirl.txt");
    } else if (this.value === "Imouto") {
      includeShow = true;
      list = "Imouto";
      genderOption = false;
      readTextFile("https://rawgit.com/ace3df/AcePictureBot/master/lists/Imouto.txt");
    } else if (this.value === "Onee-chan") {
      includeShow = true;
      list = "Onee-chan";
      genderOption = false;
      readTextFile("https://rawgit.com/ace3df/AcePictureBot/master/lists/Onee-chan.txt");
    } else if (this.value === "Onii-chan") {
      includeShow = true;
      list = "Onii-chan";
      genderOption = false;
      readTextFile("https://rawgit.com/ace3df/AcePictureBot/master/lists/Onii-chan.txt");
    } else if (this.value === "Shota") {
      includeShow = true;
      list = "Shota";
      genderOption = false;
      readTextFile("https://rawgit.com/ace3df/AcePictureBot/master/lists/Shota.txt");
    } else if (this.value === "Monstergirl") {
      includeShow = true;
      list = "Monstergirl";
      genderOption = false;
      readTextFile("https://rawgit.com/ace3df/AcePictureBot/master/lists/Monstergirl.txt");
    } else if (this.value === "Vocaloid") {
      includeShow = false;
      list = "Vocaloid";
      genderOption = false;
      readTextFile("https://rawgit.com/ace3df/AcePictureBot/master/lists/Vocaloid.txt");
    } else if (this.value === "Touhou") {
      includeShow = false;
      list = "Touhou";
      genderOption = false;
      readTextFile("https://rawgit.com/ace3df/AcePictureBot/master/lists/Touhou.txt");
    } else if (this.value === "Witchgirl") {
      includeShow = false;
      list = "Witchgirl";
      genderOption = false;
      readTextFile("https://rawgit.com/ace3df/AcePictureBot/master/lists/Witchgirl.txt");
    } else if (this.value === "Tankgirl") {
      includeShow = false;
      list = "Tankgirl";
      genderOption = false;
      readTextFile("https://rawgit.com/ace3df/AcePictureBot/master/lists/Tankgirl.txt");
    }
    if (!genderOption){
      $("#optionalSettings").fadeOut(function() {
        $("#optionalSettings").hide();
      });
    }
    $("#listType").fadeOut(function() {
      $(this).text("Your " + $("#pos_lists").find(":selected").text() + " is...");
    });
    $("#listType").fadeIn();
    resetHTML();
  });

$(document).on('change', '#gender', function() {
    includeShow = true;
    cleanedArray = [];
    cleanedArrayTwo = [];
    if (list === "OTP"){
      if (this.value === "Both") {
        readTextFile("https://rawgit.com/ace3df/AcePictureBot/master/lists/Waifu%20List.txt");
        readTextFile("https://rawgit.com/ace3df/AcePictureBot/master/lists/Husbando%20List.txt", true);
      } else if (this.value === "Yuri") {
        readTextFile("https://rawgit.com/ace3df/AcePictureBot/master/lists/Waifu%20List.txt");
        readTextFile("https://rawgit.com/ace3df/AcePictureBot/master/lists/Waifu%20List.txt", true);
      } else if (this.value === "Yaoi") {
        readTextFile("https://rawgit.com/ace3df/AcePictureBot/master/lists/Husbando%20List.txt");
        readTextFile("https://rawgit.com/ace3df/AcePictureBot/master/lists/Husbando%20List.txt", true);
      }
    }
    else if (list === "Senpai"){
      if (this.value === "Both") {
        readTextFile("https://rawgit.com/ace3df/AcePictureBot/master/lists/Senpai%20Female.txt");
        readTextFile("https://rawgit.com/ace3df/AcePictureBot/master/lists/Senpai%20Male.txt", true);
      } else if (this.value === "Female") {
        readTextFile("https://rawgit.com/ace3df/AcePictureBot/master/lists/Senpai%20Female.txt");
      } else if (this.value === "Male") {
        readTextFile("https://rawgit.com/ace3df/AcePictureBot/master/lists/Senpai%20Male.txt");
      }
    }
    else if (list === "Sensei"){
      if (this.value === "Both") {
        readTextFile("https://rawgit.com/ace3df/AcePictureBot/master/lists/Sensei%20Female.txt");
        readTextFile("https://rawgit.com/ace3df/AcePictureBot/master/lists/Sensei%20Male.txt", true);
      } else if (this.value === "Female") {
        readTextFile("https://rawgit.com/ace3df/AcePictureBot/master/lists/Sensei%20Female.txt");
      } else if (this.value === "Male") {
        readTextFile("https://rawgit.com/ace3df/AcePictureBot/master/lists/Sensei%20Male.txt");
      }
    }
    else if (list === "Kouhai"){
      if (this.value === "Both") {
        readTextFile("https://rawgit.com/ace3df/AcePictureBot/master/lists/Kouhai%20Female.txt");
        readTextFile("https://rawgit.com/ace3df/AcePictureBot/master/lists/Kouhai%20Male.txt", true);
      } else if (this.value === "Female") {
        readTextFile("https://rawgit.com/ace3df/AcePictureBot/master/lists/Kouhai%20Female.txt");
      } else if (this.value === "Male") {
        readTextFile("https://rawgit.com/ace3df/AcePictureBot/master/lists/Kouhai%20Male.txt");
      }
    }
    else if (list === "Shipgirl"){
      includeShow = false;
      if (this.value === "Kancolle") {
        readTextFile("https://rawgit.com/ace3df/AcePictureBot/master/lists/Shipgirl.txt");
      } else if (this.value === "Aoki-Hagane-no-Arpeggio") {
        readTextFile("https://rawgit.com/ace3df/AcePictureBot/master/lists/Shipgirl%20Aoki.txt");
      } else if (this.value === "Both") {
        readTextFile("https://rawgit.com/ace3df/AcePictureBot/master/lists/Shipgirl.txt");
        readTextFile("https://rawgit.com/ace3df/AcePictureBot/master/lists/Shipgirl%20Aoki.txt", true);      }
    }
    else if (list === "Idol"){
      value = this.value;
      $.when(readTextFile("https://rawgit.com/ace3df/AcePictureBot/master/lists/Idol.txt")).done(function(){
        $(document).ajaxStop(function() {
            // 0 === $.active
            if (!(value === "All-Idol-Shows")) {
              praseArrayWith(1, value);
            }
        });
      });
    }
  });

// The SPIN button
$(document).ready(function() {
    $("#btnSubmit").click(function() {
      $(this).attr('disabled', 'disabled');
      setTimeout(enableButton, 1500);
      resetHTML();
      if (list === "OTP") {
        tempArray = shuffle(cleanedArray);
        tempArrayTwo = shuffle(cleanedArrayTwo);
        var itemOne = "";
        var itemTwo = "";
        itemOne = tempArray[Math.floor(Math.random() * tempArray.length)].split("||");
        itemTwo = tempArrayTwo[Math.floor(Math.random() * tempArrayTwo.length)].split("||");
        post_text = itemOne[0].replace(/ *\([^)]*\) */g, "") + " x " + itemTwo[0].replace(/ *\([^)]*\) */g, "");
        if (includeShow) {
          from_show = "Series:&nbsp;<a href='http://myanimelist.net/anime.php?q=" + itemOne[1] + "'>" + itemOne[1] + "</a>&nbsp;|&nbsp;<a href='http://myanimelist.net/anime.php?q=" + itemTwo[1] + "'>" + itemTwo[1] + "</a>";
          $("#fromshow").html(from_show)
        } else {
          $("#fromshow").fadeOut();
        }
        loadImageOTP(itemOne[2], itemTwo[2]);
      }
      else {
        if (cleanedArrayTwo.length > 0){
          var rnd = Math.random();
          if (rnd < 0.25) {
            // 25% chance of getting second array.
            // People will want female over male so it's w/e with this.
            // This array will ALWAYS be Male gender so
            gender = "husbando";
            tempArray = shuffle(cleanedArrayTwo);
          }
          else {
            gender = "waifu";
            tempArray = shuffle(cleanedArray);
          }
        }
        else {
          tempArray = shuffle(cleanedArray);
        }
        var item = "";
        item = tempArray[Math.floor(Math.random() * tempArray.length)].split("||");
        post_text = item[0].replace(/ *\([^)]*\) */g, "");
        if (includeShow) {
          from_show = "Series:&nbsp;<a href='http://myanimelist.net/anime.php?q=" + item[1] + "'>" + item[1] + "</a>";
          $("#fromshow").html(from_show)
        } else {
          $("#fromshow").fadeOut();
        }
        loadImage(item[0], $("#pos_lists").find(":selected").text().toLowerCase(), item[2]);
      }
      $("#result").text(post_text);
      $("#shareText").text("Share your " + $("#pos_lists").find(":selected").text() + "!");
      $("#shareButtons").attr("data-a2a-title", "My " + $("#pos_lists").find(":selected").text() + " is " + post_text + "! Find yours out here: ")
      $("#artby").html("<a href=http://saucenao.com/search.php?urlify=1&url=" + loc + ">" + "Search for the artist source of this image!</a>");
      $("#reportImage").html("<a href=\"https://twitter.com/intent/tweet?text=@AceStatusBot The image for " + post_text + " is NSFW/wrong!\" data-size=\"large\">*Report this image for being NSFW or wrong!</a>")
      restoreHTML();
    })
  });

  var enableButton = function() {
    $('#btnSubmit').removeAttr('disabled');
  }
