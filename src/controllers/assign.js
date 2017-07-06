"use strict";

module.exports = {
  actionIdToVerb(id) {
    let name = "Unknown";
    switch (id) {
      case "interview": name = "Interview"; break;
      case "sustain": name = "Sustain"; break;
      case "setApart": name = "Set Apart"; break;
    }

    return name;
  },

  actionIdToNoun(id) {
    let name = "Unknown";
    switch (id) {
      case "interview": name = "Interview"; break;
      case "sustain": name = "Sustaining"; break;
      case "setApart": name = "Setting Apart"; break;
    }

    return name;
  },
};