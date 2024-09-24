<?php

namespace UWMadison\TimeEnhancements;

use ExternalModules\AbstractExternalModule;
use REDCap;

class TimeEnhancements extends AbstractExternalModule
{
    public function redcap_every_page_top($project_id)
    {
        $this->initializeJavascriptModuleObject();

        // Designer Page
        if ($this->isPage('Design/online_designer.php') && $project_id && $_GET['page']) {
            $this->includeJs("index.js");
        }
    }

    public function redcap_data_entry_form($project_id, $record, $instrument)
    {
        $this->actionTags($instrument);
        $this->includeJs("index.js");
    }

    public function redcap_survey_page($project_id, $record, $instrument)
    {
        $this->actionTags($instrument);
        $this->includeJs("index.js");
    }

    private function actionTags($instrument)
    {
        // Action tags that are JS based
        $validation = "text_validation_type_or_show_slider_number";
        $tomorrow = [];
        $workday = [];
        $addDays = [];
        $dd = REDCap::getDataDictionary("array", false, null, $instrument);
        foreach ($dd as $field => $info) {
            if (str_contains($info[$validation], 'date_') && $info["field_type"] == "text") {
                //@TOMORROWBUTTON
                if (str_contains($info["field_annotation"], "@TOMORROWBUTTON"))
                    $tomorrow[] = $field;
                //@NEXTWORKDAYBUTTON
                if (str_contains($info["field_annotation"], "@NEXTWORKDAYBUTTON"))
                    $workday[] = $field;
                //@ADDDAYSBUTTON (support multiple)
                foreach (explode("@", $info["field_annotation"]) as $annotation) {
                    if (str_starts_with($annotation, "ADDDAYSBUTTON=")) {
                        $tmp = explode(",", trim(str_replace("ADDDAYSBUTTON=", "", $annotation), ' "'));
                        $addDays[$field][] = [
                            "days" => intval($tmp[0]),
                            "text" => $tmp[1],
                        ];
                    }
                }
            }
        }
        $this->passArgument([
            "@TOMORROWBUTTON" => $tomorrow,
            "@NEXTWORKDAYBUTTON" => $workday,
            "@ADDDAYSBUTTON" => $addDays,
        ]);
    }

    private function includeJs($path)
    {
        echo '<script src="' . $this->getUrl($path) . '"></script>' . "\n";
    }

    private function passArgument($arr)
    {
        $obj = $this->getJavascriptModuleObjectName();
        echo "<script> Object.assign($obj, " . json_encode($arr) . ");</script>";
    }
}
