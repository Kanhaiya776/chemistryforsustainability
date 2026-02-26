<?php

namespace Drupal\ggcp_customs\Plugin\Field\FieldType;

use Drupal\field_time\Plugin\Field\FieldType\TimeRangeType;
use Symfony\Component\Validator\Context\ExecutionContextInterface;

/**
 * Custom override of TimeRangeType to modify validation.
 */
class CustomTimeRangeType extends TimeRangeType {

  /**
   * Custom time range validation.
   */
  public function validateTimeRange($item, ExecutionContextInterface $context, $payload) {

    if (empty($item->from) || empty($item->to)) {
      unset($item->from);
      unset($item->to);
    }

  }

}
