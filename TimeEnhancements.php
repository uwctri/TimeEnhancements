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
        $tomorrow = [];
        $workday = [];
        $dd = REDCap::getDataDictionary("array", false, null, $instrument);
        foreach ($dd as $field => $info) {
            //@TOMORROWBUTTON
            if ((strpos($info['field_type'], 'date_') !== false) && (strpos($info["field_annotation"], "@TOMORROWBUTTON") !== false)) {
            }
            //@NEXTWORKDAYBUTTON
            if ((strpos($info['field_type'], 'date_') !== false) && (strpos($info["field_annotation"], "@NEXTWORKDAYBUTTON") !== false)) {
            }
        }
        $this->passArgument([
            "@TOMORROWBUTTON" => $tomorrow,
            "@NEXTWORKDAYBUTTON" => $workday
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
