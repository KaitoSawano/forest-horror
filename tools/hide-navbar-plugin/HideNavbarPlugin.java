package com.atticforge.umbragrove;

import android.os.Build;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowInsetsController;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "HideNavbar")
public class HideNavbarPlugin extends Plugin {

    @PluginMethod
    public void hide(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            View decorView = getActivity().getWindow().getDecorView();

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                WindowInsetsController controller = getActivity().getWindow().getInsetsController();
                if (controller != null) {
                    controller.hide(WindowInsets.Type.navigationBars());
                    controller.setSystemBarsBehavior(
                        WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
                    );
                }
            } else {
                decorView.setSystemUiVisibility(
                    View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                    | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                    | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                    | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                );
            }
            call.resolve();
        });
    }

    @PluginMethod
    public void show(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            View decorView = getActivity().getWindow().getDecorView();
            decorView.setSystemUiVisibility(View.SYSTEM_UI_FLAG_VISIBLE);
            call.resolve();
        });
    }
}
