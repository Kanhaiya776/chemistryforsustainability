<?php

namespace Drupal\ggcp_customs\Ajax;

use Drupal\Core\Ajax\CommandInterface;

class UserProfileCloseCommand implements CommandInterface {

  public function render() {
    return [
      'command' => 'userProfileClose',
    ];
  }
}
