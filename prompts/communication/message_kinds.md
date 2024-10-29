# current

communication occurs bewteen

native_app\main.go

and

pages\options\src\components\CodeTab.tsx

through stdin, stdout.

I want to have independent communication dedicated class in both sides.

have

native_app\communication\{classes}

pages\options\src\components\communication\{classes}

I want to have dedicated data class same name, same fields for both so make it easy to grasp communications will be done.

could you think about what kind of classes would be helpful for best practice maintainability.


what if I want such communication, how will it done?

native app side point of view.

kind = SAVE_TO_PATH

which receives filePath as full path, content as plain text, save content to path. responce as success / fail and error, cause.

kind = GET_CODE_TREE

which receives target_path, responce every git repository visible (include untracked files, exclude .ignore files) files.

kind = GET_CONTENTS

which receives list of full path, response file contents in list.

